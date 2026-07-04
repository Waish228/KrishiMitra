import { GoogleGenAI } from '@google/genai';
import type { SupportedLanguage } from './prompts';
import { getSystemPrompt } from './prompts';
import { AI_CONFIG } from './config';
import type { Message } from '../types';

// Initialize the client. In a real production app, you might want to proxy this through your own backend
// to hide the API key, but for this demo/prototype it runs in the browser.
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function* streamChatResponse(
  messageHistory: Message[],
  newMessage: string,
  language: SupportedLanguage
): AsyncGenerator<string, void, unknown> {
  const systemInstruction = getSystemPrompt(language);
  
  // Convert our internal Message format to Gemini's format
  const contents = messageHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Append the new user message
  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  try {
    const responseStream = await ai.models.generateContentStream({
      model: AI_CONFIG.primaryModel,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: AI_CONFIG.temperature,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Error in Gemini API stream:', error);
    yield "\n\n**Error:** I'm sorry, but I am unable to connect to my AI systems right now. Please try again later.";
  }
}
