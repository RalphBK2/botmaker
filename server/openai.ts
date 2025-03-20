import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-demo",
});

/**
 * Generate a response for a chatbot based on the user's message and conversation history
 */
export async function generateChatResponse(chatbot: any, message: string, conversationHistory: any[] = []) {
  try {
    // Prepare system message based on chatbot settings
    let systemMessage = "You are a helpful AI assistant.";
    
    if (chatbot) {
      systemMessage = `You are a chatbot named ${chatbot.name}.`;
      
      if (chatbot.description) {
        systemMessage += ` ${chatbot.description}`;
      }
      
      if (chatbot.persona) {
        systemMessage += ` ${chatbot.persona}`;
      }
    }
    
    // Prepare conversation history
    const messages = [
      { role: "system", content: systemMessage },
    ];
    
    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }
    
    // Add user message
    messages.push({ role: "user", content: message });
    
    // Generate response
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: chatbot?.temperature || 0.7,
      max_tokens: chatbot?.maxTokens || 512,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI error:", error);
    throw new Error("Failed to generate response");
  }
}

/**
 * Generate an embedding for the given text
 */
export async function generateEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error("OpenAI embedding error:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Get available OpenAI models
 */
export async function getModels() {
  try {
    const response = await openai.models.list();
    
    return response.data.filter(model => 
      model.id.includes("gpt") || 
      model.id.includes("text-davinci") || 
      model.id.includes("claude")
    );
  } catch (error) {
    console.error("OpenAI models error:", error);
    throw new Error("Failed to get models");
  }
}

/**
 * Generate a personalized training data completion
 */
export async function generateTrainingCompletion(data: string, instructions: string) {
  try {
    const prompt = `Below is some training data for an AI chatbot:
${data}

Instructions for how to use this data:
${instructions}

Please generate a structured completion in JSON format that can be used to train the chatbot effectively.`;
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI training completion error:", error);
    throw new Error("Failed to generate training completion");
  }
}

/**
 * Analyze conversation data to extract insights
 */
export async function analyzeConversations(conversations: any[]) {
  try {
    const conversationsData = JSON.stringify(conversations);
    
    const prompt = `Analyze the following conversation data from a chatbot:
${conversationsData}

Please provide analysis and insights in JSON format including:
1. Common topics/questions
2. Sentiment analysis
3. Areas for improvement
4. Success metrics`;
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI conversation analysis error:", error);
    throw new Error("Failed to analyze conversations");
  }
}
