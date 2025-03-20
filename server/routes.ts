import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hash, compare } from "bcrypt";
import session from "express-session";
import { z } from "zod";
import { insertUserSchema, insertChatbotSchema, insertTemplateSchema, insertSubscriptionSchema } from "@shared/schema";
import { zValidate } from "./middleware";
import { generateChatResponse, generateEmbedding, getModels } from "./openai";
import MemoryStore from "memorystore";

// Extend Express session to include userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "chatbotx-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // prune expired entries every 24h
      })
    })
  );

  // Authentication Routes
  app.post("/api/auth/register", zValidate(insertUserSchema.extend({
    email: z.string().email()
  })), async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName: "",
        avatarUrl: "",
        role: "user",
        createdAt: new Date().toISOString(),
      });
      
      // Create default subscription for new user
      await storage.createSubscription({
        userId: user.id,
        planId: "basic",
        status: "active",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Get user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const validPassword = await compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Auth check error:", error);
      return res.status(500).json({ message: "Authentication check failed" });
    }
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(500).json({ message: "Authentication error" });
    }
  };

  // Dashboard Route
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's chatbots
      const chatbots = await storage.getChatbotsByUserId(userId);
      
      // Get templates
      const templates = await storage.getTemplates();
      
      // Generate mock stats for dashboard
      const stats = {
        activeChatbots: chatbots.filter(c => c.status === "active").length,
        activeChatbotsChange: 20,
        totalConversations: 1482,
        totalConversationsChange: 24,
        resolutionRate: 86,
        resolutionRateChange: 5
      };
      
      return res.status(200).json({
        chatbots: chatbots.slice(0, 3).map(chatbot => ({
          id: chatbot.id,
          name: chatbot.name,
          flows: chatbot.flows.length,
          status: chatbot.status,
          color: chatbot.color,
        })),
        templates: templates.slice(0, 3).map(template => ({
          id: template.id,
          name: template.name,
          description: template.description,
          icon: template.icon,
          color: template.color,
        })),
        stats,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      return res.status(500).json({ message: "Failed to load dashboard data" });
    }
  });

  // Chatbots Routes
  app.get("/api/chatbots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const chatbots = await storage.getChatbotsByUserId(userId);
      
      return res.status(200).json(chatbots.map(chatbot => ({
        id: chatbot.id,
        name: chatbot.name,
        flows: chatbot.flows.length,
        status: chatbot.status,
        color: chatbot.color,
        created: chatbot.createdAt,
        updated: chatbot.updatedAt,
        conversations: Math.floor(Math.random() * 100) + 10, // Mock data
      })));
    } catch (error) {
      console.error("Chatbots error:", error);
      return res.status(500).json({ message: "Failed to load chatbots" });
    }
  });

  app.get("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = req.params.id;
      const userId = req.user.id;
      
      const chatbot = await storage.getChatbotById(chatbotId);
      if (!chatbot) {
        return res.status(404).json({ message: "Chatbot not found" });
      }
      
      if (chatbot.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      return res.status(200).json(chatbot);
    } catch (error) {
      console.error("Chatbot error:", error);
      return res.status(500).json({ message: "Failed to load chatbot" });
    }
  });

  app.post("/api/chatbots", isAuthenticated, zValidate(insertChatbotSchema), async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user subscription to check chatbot limits
      const subscription = await storage.getSubscriptionByUserId(userId);
      if (!subscription) {
        return res.status(400).json({ message: "No active subscription found" });
      }
      
      // Get plan details
      const plan = await storage.getPlanById(subscription.planId);
      if (!plan) {
        return res.status(400).json({ message: "Subscription plan not found" });
      }
      
      // Check if user has reached chatbot limit for their plan
      const chatbotsCount = await storage.getChatbotsCountByUserId(userId);
      if (chatbotsCount >= plan.maxChatbots) {
        return res.status(400).json({ 
          message: `You have reached the maximum number of chatbots (${plan.maxChatbots}) for your subscription plan. Please upgrade to create more.` 
        });
      }
      
      const chatbotData = {
        ...req.body,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const chatbot = await storage.createChatbot(chatbotData);
      
      return res.status(201).json(chatbot);
    } catch (error) {
      console.error("Create chatbot error:", error);
      return res.status(500).json({ message: "Failed to create chatbot" });
    }
  });

  app.patch("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = req.params.id;
      const userId = req.user.id;
      
      // Get chatbot
      const chatbot = await storage.getChatbotById(chatbotId);
      if (!chatbot) {
        return res.status(404).json({ message: "Chatbot not found" });
      }
      
      // Check if user owns the chatbot
      if (chatbot.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Update chatbot
      const updatedChatbot = await storage.updateChatbot(chatbotId, {
        ...req.body,
        updatedAt: new Date().toISOString(),
      });
      
      return res.status(200).json(updatedChatbot);
    } catch (error) {
      console.error("Update chatbot error:", error);
      return res.status(500).json({ message: "Failed to update chatbot" });
    }
  });

  app.delete("/api/chatbots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const chatbotId = req.params.id;
      const userId = req.user.id;
      
      // Get chatbot
      const chatbot = await storage.getChatbotById(chatbotId);
      if (!chatbot) {
        return res.status(404).json({ message: "Chatbot not found" });
      }
      
      // Check if user owns the chatbot
      if (chatbot.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Delete chatbot
      await storage.deleteChatbot(chatbotId);
      
      return res.status(200).json({ message: "Chatbot deleted successfully" });
    } catch (error) {
      console.error("Delete chatbot error:", error);
      return res.status(500).json({ message: "Failed to delete chatbot" });
    }
  });

  // Templates Routes
  app.get("/api/templates", isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      return res.status(200).json(templates);
    } catch (error) {
      console.error("Templates error:", error);
      return res.status(500).json({ message: "Failed to load templates" });
    }
  });

  // Chatbot API Routes for end-users
  app.post("/api/chatbot/response", async (req, res) => {
    try {
      const { chatbotId, message, conversationId } = req.body;
      
      // Get chatbot
      const chatbot = await storage.getChatbotById(chatbotId);
      if (!chatbot) {
        return res.status(404).json({ message: "Chatbot not found" });
      }
      
      // Check if chatbot is active
      if (chatbot.status !== "active") {
        return res.status(400).json({ message: "Chatbot is not active" });
      }
      
      // Create or continue conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversationById(conversationId);
        if (!conversation || conversation.chatbotId !== chatbotId) {
          return res.status(404).json({ message: "Conversation not found" });
        }
      } else {
        // Create new conversation
        conversation = await storage.createConversation({
          chatbotId,
          startedAt: new Date().toISOString(),
          messages: [],
        });
      }
      
      // Add user message to conversation
      const userMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      await storage.addMessageToConversation(conversation.id, userMessage);
      
      // Get response from OpenAI
      const aiResponse = await generateChatResponse(chatbot, message, conversation.messages);
      
      // Add AI response to conversation
      const aiMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      await storage.addMessageToConversation(conversation.id, aiMessage);
      
      return res.status(200).json({
        response: aiResponse,
        conversationId: conversation.id,
      });
    } catch (error) {
      console.error("Chatbot response error:", error);
      return res.status(500).json({ message: "Failed to generate response" });
    }
  });

  // Analytics Routes
  app.get("/api/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const timeRange = req.query.timeRange || "30d";
      
      // Generate mock analytics data
      const data = {
        overview: {
          totalConversations: 1482,
          totalUsers: 873,
          averageDuration: "2m 15s",
          resolutionRate: 86,
        },
        conversationsByDay: generateDailyData(timeRange),
        conversationsBySource: [
          { source: "Website", value: 60 },
          { source: "Mobile App", value: 25 },
          { source: "Facebook", value: 8 },
          { source: "WhatsApp", value: 5 },
          { source: "Other", value: 2 },
        ],
        topQuestions: [
          { question: "What are your pricing plans?", count: 87, resolutionRate: 92 },
          { question: "How do I reset my password?", count: 64, resolutionRate: 95 },
          { question: "Do you offer refunds?", count: 42, resolutionRate: 78 },
          { question: "How do I contact support?", count: 39, resolutionRate: 85 },
          { question: "What payment methods do you accept?", count: 31, resolutionRate: 89 },
        ],
        performance: [
          { metric: "Response Time", value: 2.5, change: 15 },
          { metric: "Resolution Rate", value: 86, change: 5 },
          { metric: "User Satisfaction", value: 92, change: 8 },
          { metric: "Message Volume", value: 1482, change: 24 },
        ],
      };
      
      return res.status(200).json(data);
    } catch (error) {
      console.error("Analytics error:", error);
      return res.status(500).json({ message: "Failed to load analytics data" });
    }
  });

  // Billing Routes
  app.get("/api/billing", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's subscription
      const subscription = await storage.getSubscriptionByUserId(userId);
      if (!subscription) {
        return res.status(404).json({ message: "No subscription found" });
      }
      
      // Get all plans
      const plans = await storage.getPlans();
      
      // Get current plan
      const currentPlan = plans.find(p => p.id === subscription.planId);
      if (!currentPlan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Generate mock billing data
      const data = {
        currentPlan: {
          ...currentPlan,
          isCurrent: true,
        },
        plans: plans.map(plan => ({
          ...plan,
          isCurrent: plan.id === subscription.planId,
          isPopular: plan.id === "professional",
        })),
        billingInfo: {
          name: req.user.fullName || req.user.username,
          card: {
            last4: "4242",
            brand: "Visa",
            expMonth: 12,
            expYear: 2025,
          },
          nextBillingDate: subscription.renewalDate,
        },
        invoices: generateMockInvoices(),
      };
      
      return res.status(200).json(data);
    } catch (error) {
      console.error("Billing error:", error);
      return res.status(500).json({ message: "Failed to load billing data" });
    }
  });

  app.post("/api/billing/upgrade", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      
      // Check if plan exists
      const plan = await storage.getPlanById(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      // Get current subscription
      const subscription = await storage.getSubscriptionByUserId(userId);
      if (!subscription) {
        return res.status(404).json({ message: "No subscription found" });
      }
      
      // Update subscription
      const now = new Date();
      const nextMonth = new Date(now.setMonth(now.getMonth() + 1));
      
      const updatedSubscription = await storage.updateSubscription(subscription.id, {
        planId,
        status: "active",
        startDate: new Date().toISOString(),
        endDate: nextMonth.toISOString(),
        renewalDate: nextMonth.toISOString(),
      });
      
      return res.status(200).json(updatedSubscription);
    } catch (error) {
      console.error("Upgrade plan error:", error);
      return res.status(500).json({ message: "Failed to upgrade plan" });
    }
  });

  // Profile Routes
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...profile } = user;
      
      return res.status(200).json(profile);
    } catch (error) {
      console.error("Profile error:", error);
      return res.status(500).json({ message: "Failed to load profile" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { fullName, email, company, website, bio } = req.body;
      
      // Update user profile
      const updatedUser = await storage.updateUser(userId, {
        fullName,
        email,
        company,
        website,
        bio,
      });
      
      // Return user without password
      const { password, ...profile } = updatedUser;
      
      return res.status(200).json(profile);
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.patch("/api/profile/password", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hash(newPassword, 10);
      
      // Update user password
      await storage.updateUser(userId, {
        password: hashedPassword,
      });
      
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      return res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Settings Routes
  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user settings, or create default settings if none exist
      let settings = await storage.getSettingsByUserId(userId);
      if (!settings) {
        // Create default settings
        settings = await storage.createSettings({
          userId,
          api: {
            openAiApiKey: process.env.OPENAI_API_KEY || "",
            defaultModel: "gpt-4o",
            apiRateLimit: 60,
          },
          notifications: {
            emailNotifications: true,
            chatbotUpdates: true,
            weeklyReports: true,
            securityAlerts: true,
            marketingEmails: false,
          },
          appearance: {
            theme: "light",
            accentColor: "#3B82F6",
            sidebarCollapsed: false,
          },
        });
      }
      
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Settings error:", error);
      return res.status(500).json({ message: "Failed to load settings" });
    }
  });

  app.patch("/api/settings/api", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const apiSettings = req.body;
      
      // Update API settings
      const settings = await storage.updateSettings(userId, { api: apiSettings });
      
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Update API settings error:", error);
      return res.status(500).json({ message: "Failed to update API settings" });
    }
  });

  app.patch("/api/settings/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notificationSettings = req.body;
      
      // Update notification settings
      const settings = await storage.updateSettings(userId, { notifications: notificationSettings });
      
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Update notification settings error:", error);
      return res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  app.patch("/api/settings/appearance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const appearanceSettings = req.body;
      
      // Update appearance settings
      const settings = await storage.updateSettings(userId, { appearance: appearanceSettings });
      
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Update appearance settings error:", error);
      return res.status(500).json({ message: "Failed to update appearance settings" });
    }
  });

  // OpenAI-related routes
  app.post("/api/generate/persona", isAuthenticated, async (req: any, res) => {
    try {
      const { industry, tone, purpose } = req.body;
      
      if (!industry || !tone || !purpose) {
        return res.status(400).json({ message: "Industry, tone, and purpose are required" });
      }
      
      // Generate persona using OpenAI
      const prompt = `Create a chatbot persona for a ${industry} business with a ${tone} tone. The chatbot's purpose is to ${purpose}. The response should include:
1. Greeting message
2. Persona description (2-3 sentences)
3. Voice and tone guidelines
4. Sample responses to common questions`;
      
      // Get response from OpenAI
      const persona = await generateChatResponse(null, prompt, []);
      
      return res.status(200).json({ persona });
    } catch (error) {
      console.error("Generate persona error:", error);
      return res.status(500).json({ message: "Failed to generate persona" });
    }
  });

  app.post("/api/embeddings", isAuthenticated, async (req: any, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      // Generate embedding using OpenAI
      const embedding = await generateEmbedding(text);
      
      return res.status(200).json({ embedding });
    } catch (error) {
      console.error("Generate embedding error:", error);
      return res.status(500).json({ message: "Failed to generate embedding" });
    }
  });

  app.get("/api/ai/models", isAuthenticated, async (req, res) => {
    try {
      // Get available models
      const models = await getModels();
      
      return res.status(200).json(models);
    } catch (error) {
      console.error("AI models error:", error);
      return res.status(500).json({ message: "Failed to get AI models" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate daily data for analytics
function generateDailyData(timeRange: string): { date: string; conversations: number }[] {
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      conversations: Math.floor(Math.random() * 50) + 20,
    });
  }
  
  return data;
}

// Helper function to generate mock invoices
function generateMockInvoices(): { id: string; date: string; amount: number; status: 'paid' | 'pending' | 'failed'; downloadUrl: string }[] {
  const invoices = [];
  const now = new Date();
  
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setMonth(now.getMonth() - i);
    
    invoices.push({
      id: `INV-${Math.floor(Math.random() * 10000)}`,
      date: date.toISOString(),
      amount: 29.99,
      status: i === 0 ? 'pending' : 'paid',
      downloadUrl: `/api/invoices/download/${i}`,
    });
  }
  
  return invoices;
}
