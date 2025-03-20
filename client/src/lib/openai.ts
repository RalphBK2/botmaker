import { apiRequest } from "@/lib/queryClient";

// OpenAI integration client-side helper functions

/**
 * Generate a chatbot response using OpenAI
 */
export async function generateChatbotResponse(chatbotId: string, message: string, conversationId?: string) {
  try {
    const response = await apiRequest("POST", "/api/chatbot/response", {
      chatbotId,
      message,
      conversationId,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    throw error;
  }
}

/**
 * Train a chatbot with custom data
 */
export async function trainChatbot(chatbotId: string, trainingData: string) {
  try {
    const response = await apiRequest("POST", `/api/chatbots/${chatbotId}/train`, {
      trainingData,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error training chatbot:", error);
    throw error;
  }
}

/**
 * Test a chatbot with a sample message
 */
export async function testChatbot(chatbotId: string, message: string) {
  try {
    const response = await apiRequest("POST", `/api/chatbots/${chatbotId}/test`, {
      message,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error testing chatbot:", error);
    throw error;
  }
}

/**
 * Generate a unique embedding for an input text to use in semantic search
 */
export async function generateEmbedding(text: string) {
  try {
    const response = await apiRequest("POST", "/api/embeddings", {
      text,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * Generate a personalized chatbot persona
 */
export async function generateChatbotPersona(industry: string, tone: string, purpose: string) {
  try {
    const response = await apiRequest("POST", "/api/generate/persona", {
      industry,
      tone,
      purpose,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error generating chatbot persona:", error);
    throw error;
  }
}

/**
 * Analyze conversation data for insights
 */
export async function analyzeConversations(chatbotId: string, dateRange: { start: string, end: string }) {
  try {
    const response = await apiRequest("POST", `/api/chatbots/${chatbotId}/analyze`, {
      dateRange,
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error analyzing conversations:", error);
    throw error;
  }
}
