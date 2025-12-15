/**
 * AI Chatbot Service
 * 
 * Provides conversational AI for air quality questions using Groq API (primary)
 * with Gemini as fallback
 */

const axios = require('axios');

// Groq API configuration (primary)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

// Gemini API configuration (fallback)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Conversation history cache (per session)
const conversationHistory = new Map();
const HISTORY_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * System prompt for the chatbot
 */
const SYSTEM_PROMPT = `You are an AI assistant for Airyze AQI Monitor, an air quality monitoring application. Your role is to help users understand air quality, health impacts, and provide actionable advice.

Key information:
- AQI Scale: 1=Good (Green), 2=Fair (Light Green), 3=Moderate (Yellow), 4=Poor (Orange), 5=Very Poor (Red)
- Main pollutants: PM2.5, PM10, O3 (Ozone), NO2, SO2, CO
- The app monitors air quality in Pakistan and worldwide
- Users can get real-time AQI data, historical trends, and personalized health recommendations

Guidelines:
- Be friendly, helpful, and conversational
- Provide accurate information about air quality and health
- Give practical, actionable advice
- If asked about medical conditions, remind users to consult healthcare professionals
- Keep responses concise (2-4 paragraphs max)
- Use simple language, avoid technical jargon unless asked
- If you don't know something, admit it honestly

You can help with:
- Explaining AQI levels and what they mean
- Health effects of different pollutants
- Protective measures for different AQI levels
- Understanding air quality data
- Tips for reducing exposure to air pollution
- General questions about the Airyze app features`;

/**
 * Get or create conversation history for a session
 */
function getConversationHistory(sessionId) {
  if (!conversationHistory.has(sessionId)) {
    conversationHistory.set(sessionId, {
      messages: [],
      timestamp: Date.now()
    });
  }
  
  const session = conversationHistory.get(sessionId);
  
  // Check if session expired
  if (Date.now() - session.timestamp > HISTORY_TTL) {
    session.messages = [];
    session.timestamp = Date.now();
  }
  
  return session.messages;
}

/**
 * Add message to conversation history
 */
function addToHistory(sessionId, role, content) {
  const history = getConversationHistory(sessionId);
  history.push({ role, content });
  
  // Keep only last 10 messages to avoid token limits
  if (history.length > 10) {
    history.shift();
  }
  
  // Update timestamp
  conversationHistory.get(sessionId).timestamp = Date.now();
}

/**
 * Build context-aware prompt with conversation history
 */
function buildChatPrompt(userMessage, history, context = {}) {
  let prompt = SYSTEM_PROMPT + '\n\n';
  
  // Add current AQI context if available
  if (context.currentAQI) {
    prompt += `Current Context:\n`;
    prompt += `- User's City: ${context.city || 'Unknown'}\n`;
    prompt += `- Current AQI: ${context.currentAQI} (${getAQILevel(context.currentAQI)})\n`;
    if (context.pollutants) {
      prompt += `- Main Pollutants: ${formatPollutants(context.pollutants)}\n`;
    }
    prompt += '\n';
  }
  
  // Add conversation history
  if (history.length > 0) {
    prompt += 'Previous conversation:\n';
    history.forEach(msg => {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    prompt += '\n';
  }
  
  // Add current user message
  prompt += `User: ${userMessage}\n\nAssistant:`;
  
  return prompt;
}

/**
 * Get AQI level description
 */
function getAQILevel(aqi) {
  if (aqi === 1) return 'Good';
  if (aqi === 2) return 'Fair';
  if (aqi === 3) return 'Moderate';
  if (aqi === 4) return 'Poor';
  if (aqi === 5) return 'Very Poor';
  return 'Unknown';
}

/**
 * Format pollutants for context
 */
function formatPollutants(pollutants) {
  const parts = [];
  if (pollutants.pm2_5) parts.push(`PM2.5: ${pollutants.pm2_5}μg/m³`);
  if (pollutants.pm10) parts.push(`PM10: ${pollutants.pm10}μg/m³`);
  if (pollutants.o3) parts.push(`O3: ${pollutants.o3}μg/m³`);
  return parts.join(', ') || 'N/A';
}

/**
 * Call Groq API for chat response (primary)
 */
async function callGroqAPI(prompt) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.8,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }

    throw new Error('Invalid response format from Groq API');
  } catch (error) {
    console.error('Groq API error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

/**
 * Call Gemini API for chat response (fallback)
 */
async function callGeminiAPI(prompt) {
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      },
      {
        headers: {
          'x-goog-api-key': GEMINI_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text;
    }

    throw new Error('Invalid response format from Gemini API');
  } catch (error) {
    console.error('Gemini API error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Generate fallback response when Gemini API is unavailable
 */
function generateFallbackResponse(userMessage, context = {}) {
  const msg = userMessage.toLowerCase();
  
  // AQI explanation
  if (msg.includes('aqi') && (msg.includes('mean') || msg.includes('what') || msg.includes('explain'))) {
    return `AQI stands for Air Quality Index. It's a number from 1 to 5 that tells you how clean or polluted the air is:\n\n• 1 (Good) - Green: Air quality is great!\n• 2 (Fair) - Light Green: Air quality is acceptable\n• 3 (Moderate) - Yellow: Sensitive people should be careful\n• 4 (Poor) - Orange: Everyone should limit outdoor activities\n• 5 (Very Poor) - Red: Health alert! Stay indoors\n\n${context.currentAQI ? `Your current AQI in ${context.city} is ${context.currentAQI} (${getAQILevel(context.currentAQI)}).` : ''}`;
  }
  
  // PM2.5 explanation
  if (msg.includes('pm2.5') || msg.includes('pm 2.5')) {
    return `PM2.5 refers to tiny particles in the air that are 2.5 micrometers or smaller - about 30 times smaller than a human hair! These particles can:\n\n• Penetrate deep into your lungs\n• Enter your bloodstream\n• Cause respiratory and heart problems\n• Come from vehicle exhaust, industrial emissions, and burning\n\nProtection tips:\n• Wear N95 masks outdoors\n• Use air purifiers indoors\n• Avoid outdoor exercise when levels are high`;
  }
  
  // Health effects
  if (msg.includes('health') && (msg.includes('effect') || msg.includes('impact') || msg.includes('risk'))) {
    return `Air pollution can affect your health in several ways:\n\n**Short-term effects:**\n• Eye, nose, and throat irritation\n• Coughing and difficulty breathing\n• Headaches and dizziness\n• Worsening of asthma\n\n**Long-term effects:**\n• Chronic respiratory diseases\n• Heart disease\n• Lung cancer\n• Reduced lung function\n\nPeople most at risk: children, elderly, pregnant women, and those with existing health conditions.`;
  }
  
  // Protection/safety
  if (msg.includes('protect') || msg.includes('safe') || msg.includes('what should i do')) {
    const aqi = context.currentAQI || 3;
    if (aqi <= 2) {
      return `Good news! With AQI at ${aqi}, the air quality is good. You can:\n• Enjoy outdoor activities\n• Exercise outside\n• Keep windows open for ventilation\n\nJust stay aware of any changes in air quality!`;
    } else if (aqi === 3) {
      return `With moderate air quality (AQI ${aqi}), here's what you should do:\n\n• Limit prolonged outdoor activities\n• Sensitive groups should reduce outdoor exercise\n• Close windows during peak pollution hours\n• Consider wearing a mask if you're sensitive\n• Use air purifiers indoors`;
    } else {
      return `With poor air quality (AQI ${aqi}), take these precautions:\n\n• Stay indoors as much as possible\n• Keep windows and doors closed\n• Use air purifiers\n• Wear N95 masks if you must go outside\n• Avoid outdoor exercise\n• Check on vulnerable family members`;
    }
  }
  
  // Exercise
  if (msg.includes('exercise') || msg.includes('jog') || msg.includes('run') || msg.includes('workout')) {
    const aqi = context.currentAQI || 3;
    if (aqi <= 2) {
      return `Yes, it's safe to exercise outdoors! With AQI at ${aqi}, you can enjoy your workout. Just stay hydrated and listen to your body.`;
    } else if (aqi === 3) {
      return `With AQI at ${aqi}, you can exercise but with caution:\n• Reduce intensity and duration\n• Take breaks more frequently\n• Consider indoor exercise instead\n• If you have asthma or heart conditions, exercise indoors`;
    } else {
      return `With AQI at ${aqi}, outdoor exercise is NOT recommended. The air quality is too poor. Instead:\n• Exercise indoors (home workout, gym)\n• Do yoga or stretching\n• Wait for better air quality\n• Check AQI before planning outdoor activities`;
    }
  }
  
  // Mask recommendations
  if (msg.includes('mask')) {
    return `For air pollution protection:\n\n**Best masks:**\n• N95 or N99 respirators - Filter 95-99% of particles\n• KN95 masks - Similar to N95\n\n**Not effective:**\n• Cloth masks - Don't filter small particles\n• Surgical masks - Limited protection\n\n**Tips:**\n• Ensure proper fit (no gaps)\n• Replace when breathing becomes difficult\n• Don't reuse disposable masks too many times`;
  }
  
  // Default response
  return `I'm here to help with air quality questions! You can ask me about:\n\n• What AQI means and how to read it\n• Health effects of air pollution\n• How to protect yourself\n• When it's safe to exercise outdoors\n• Information about pollutants (PM2.5, PM10, O3, etc.)\n• Tips for reducing exposure\n\n${context.currentAQI ? `\nYour current AQI in ${context.city} is ${context.currentAQI} (${getAQILevel(context.currentAQI)}).` : ''}\n\nWhat would you like to know?`;
}

/**
 * Generate chat response
 * 
 * @param {string} userMessage - User's message
 * @param {string} sessionId - Session ID for conversation history
 * @param {Object} context - Additional context (currentAQI, city, pollutants)
 * @returns {Promise<string>} AI response
 */
async function generateChatResponse(userMessage, sessionId, context = {}) {
  try {
    // Get conversation history
    const history = getConversationHistory(sessionId);
    
    // Build prompt with context
    const prompt = buildChatPrompt(userMessage, history, context);
    
    // Try Groq API first (primary)
    try {
      if (!GROQ_API_KEY) {
        throw new Error('Groq API key not configured');
      }
      
      console.log('Calling Groq API for chatbot response...');
      const response = await callGroqAPI(prompt);
      
      // Add to history
      addToHistory(sessionId, 'user', userMessage);
      addToHistory(sessionId, 'assistant', response);
      
      return response;
    } catch (groqError) {
      console.error('Groq API failed:', groqError.message);
      
      // Try Gemini as fallback
      if (GEMINI_API_KEY) {
        try {
          console.log('Falling back to Gemini API...');
          const response = await callGeminiAPI(prompt);
          
          // Add to history
          addToHistory(sessionId, 'user', userMessage);
          addToHistory(sessionId, 'assistant', response);
          
          return response;
        } catch (geminiError) {
          console.error('Gemini API also failed:', geminiError.message);
        }
      }
      
      // Both APIs failed, use rule-based fallback
      console.log('Both APIs failed, using rule-based fallback');
      return generateFallbackResponse(userMessage, context);
    }
  } catch (error) {
    console.error('Error generating chat response:', error.message);
    throw error;
  }
}

/**
 * Clear conversation history for a session
 */
function clearHistory(sessionId) {
  conversationHistory.delete(sessionId);
}

/**
 * Clean up expired sessions periodically
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, session] of conversationHistory.entries()) {
    if (now - session.timestamp > HISTORY_TTL) {
      conversationHistory.delete(sessionId);
    }
  }
}

// Cleanup every 10 minutes
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);

module.exports = {
  generateChatResponse,
  clearHistory
};
