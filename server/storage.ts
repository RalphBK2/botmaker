import { 
  users, type User, type InsertUser,
  type Plan, type InsertPlan,
  type Subscription, type InsertSubscription,
  type Chatbot, type InsertChatbot,
  type Conversation, type InsertConversation,
  type Template, type InsertTemplate,
  type Settings, type InsertSettings
} from "@shared/schema";

// Interfaces for all data types needed by the application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Subscription methods
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | undefined>;

  // Plan methods
  getPlans(): Promise<Plan[]>;
  getPlanById(id: string): Promise<Plan | undefined>;

  // Chatbot methods
  getChatbotsByUserId(userId: number): Promise<Chatbot[]>;
  getChatbotById(id: number): Promise<Chatbot | undefined>;
  createChatbot(chatbot: InsertChatbot): Promise<Chatbot>;
  updateChatbot(id: number, data: Partial<Chatbot>): Promise<Chatbot | undefined>;
  deleteChatbot(id: number): Promise<boolean>;
  getChatbotsCountByUserId(userId: number): Promise<number>;

  // Conversation methods
  getConversationById(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  addMessageToConversation(id: number, message: any): Promise<Conversation | undefined>;

  // Template methods
  getTemplates(): Promise<Template[]>;
  getTemplateById(id: number): Promise<Template | undefined>;

  // Settings methods
  getSettingsByUserId(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(id: number, data: Partial<Settings>): Promise<Settings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private plans: Map<string, Plan>;
  private subscriptions: Map<number, Subscription>;
  private chatbots: Map<number, Chatbot>;
  private conversations: Map<number, Conversation>;
  private templates: Map<number, Template>;
  private settings: Map<number, Settings>;
  
  currentId: number;
  private subscriptionId: number;
  private chatbotId: number;
  private conversationId: number;
  private templateId: number;
  private settingsId: number;

  constructor() {
    this.users = new Map();
    this.plans = new Map();
    this.subscriptions = new Map();
    this.chatbots = new Map();
    this.conversations = new Map();
    this.templates = new Map();
    this.settings = new Map();
    
    this.currentId = 1;
    this.subscriptionId = 1;
    this.chatbotId = 1;
    this.conversationId = 1;
    this.templateId = 1;
    this.settingsId = 1;
    
    // Initialize with default plans
    this.initDefaultPlans();
    // Initialize with default templates
    this.initDefaultTemplates();
  }

  private initDefaultPlans(): void {
    const plans: Plan[] = [
      {
        id: "basic",
        name: "Basic",
        price: 29,
        description: "Great for individuals and small websites",
        maxChatbots: 3,
        features: [
          { name: "Up to 3 chatbots", included: true },
          { name: "Standard AI models", included: true },
          { name: "Email support", included: true },
          { name: "Analytics dashboard", included: true },
          { name: "Custom branding", included: false },
          { name: "API access", included: false }
        ]
      },
      {
        id: "pro",
        name: "Professional",
        price: 79,
        description: "Perfect for growing businesses",
        maxChatbots: 10,
        features: [
          { name: "Up to 10 chatbots", included: true },
          { name: "Advanced AI models", included: true },
          { name: "Priority support", included: true },
          { name: "Analytics dashboard", included: true },
          { name: "Custom branding", included: true },
          { name: "API access", included: true }
        ]
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 199,
        description: "For large organizations with complex needs",
        maxChatbots: 50,
        features: [
          { name: "Up to 50 chatbots", included: true },
          { name: "Premium AI models", included: true },
          { name: "24/7 dedicated support", included: true },
          { name: "Advanced analytics", included: true },
          { name: "Custom branding", included: true },
          { name: "Full API access", included: true }
        ]
      }
    ];
    
    plans.forEach(plan => {
      this.plans.set(plan.id, plan);
    });
  }

  private initDefaultTemplates(): void {
    const templates: Template[] = [
      {
        id: 1,
        name: "Customer Support",
        description: "Handle common customer inquiries and support requests",
        icon: "help",
        color: "blue",
        category: "Support",
        complexity: "moderate",
        content: { flows: [], settings: {} }
      },
      {
        id: 2,
        name: "E-commerce Assistant",
        description: "Help customers with product questions and ordering",
        icon: "shopping",
        color: "green",
        category: "Sales",
        complexity: "complex",
        content: { flows: [], settings: {} }
      },
      {
        id: 3,
        name: "Business FAQ",
        description: "Answer frequently asked questions about your business",
        icon: "business",
        color: "purple",
        category: "Information",
        complexity: "simple",
        content: { flows: [], settings: {} }
      },
      {
        id: 4,
        name: "Website Guide",
        description: "Help visitors navigate your website and find information",
        icon: "website",
        color: "orange",
        category: "Navigation",
        complexity: "simple",
        content: { flows: [], settings: {} }
      }
    ];
    
    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      fullName: insertUser.fullName || null,
      avatarUrl: insertUser.avatarUrl || null,
      createdAt: insertUser.createdAt || new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Subscription methods
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (sub) => sub.userId === userId,
    );
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const newSubscription: Subscription = { ...subscription, id };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription = { ...subscription, ...data };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Plan methods
  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  async getPlanById(id: string): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  // Chatbot methods
  async getChatbotsByUserId(userId: number): Promise<Chatbot[]> {
    return Array.from(this.chatbots.values()).filter(
      (chatbot) => chatbot.userId === userId,
    );
  }

  async getChatbotById(id: number): Promise<Chatbot | undefined> {
    return this.chatbots.get(id);
  }

  async createChatbot(chatbot: InsertChatbot): Promise<Chatbot> {
    const id = this.chatbotId++;
    
    // Ensure all required fields have default values
    const newChatbot: Chatbot = {
      id,
      name: chatbot.name,
      createdAt: chatbot.createdAt,
      userId: chatbot.userId,
      updatedAt: chatbot.updatedAt,
      status: chatbot.status || null,
      description: chatbot.description || null,
      color: chatbot.color || null,
      appearance: chatbot.appearance || {},
      settings: chatbot.settings || {},
      aiSettings: chatbot.aiSettings || {},
      flows: chatbot.flows || []
    };
    
    this.chatbots.set(id, newChatbot);
    return newChatbot;
  }

  async updateChatbot(id: number, data: Partial<Chatbot>): Promise<Chatbot | undefined> {
    const chatbot = this.chatbots.get(id);
    if (!chatbot) return undefined;
    
    const updatedChatbot = { ...chatbot, ...data };
    this.chatbots.set(id, updatedChatbot);
    return updatedChatbot;
  }

  async deleteChatbot(id: number): Promise<boolean> {
    return this.chatbots.delete(id);
  }

  async getChatbotsCountByUserId(userId: number): Promise<number> {
    const chatbots = await this.getChatbotsByUserId(userId);
    return chatbots.length;
  }

  // Conversation methods
  async getConversationById(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationId++;
    
    // Ensure all required fields have default values
    const newConversation: Conversation = {
      id,
      chatbotId: conversation.chatbotId,
      startedAt: conversation.startedAt,
      endedAt: conversation.endedAt || null,
      resolved: conversation.resolved || null,
      messages: conversation.messages || [],
      metadata: conversation.metadata || {}
    };
    
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async addMessageToConversation(id: number, message: any): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const messages = Array.isArray(conversation.messages) ? [...conversation.messages, message] : [message];
    const updatedConversation = { ...conversation, messages };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Template methods
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplateById(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  // Settings methods
  async getSettingsByUserId(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId,
    );
  }

  async createSettings(settings: InsertSettings): Promise<Settings> {
    const id = this.settingsId++;
    const newSettings: Settings = { ...settings, id };
    this.settings.set(id, newSettings);
    return newSettings;
  }

  async updateSettings(id: number, data: Partial<Settings>): Promise<Settings | undefined> {
    const settings = this.settings.get(id);
    if (!settings) return undefined;
    
    const updatedSettings = { ...settings, ...data };
    this.settings.set(id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
