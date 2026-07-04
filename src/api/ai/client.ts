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
    // Note: Using generateContent instead of generateContentStream here because
    // gemma-4-26b-a4b-it seems to be throwing 500 Internal Errors on the streaming endpoint.
    const response = await ai.models.generateContent({
      model: AI_CONFIG.primaryModel,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: AI_CONFIG.temperature,
      }
    });

    if (response.text) {
      // Yield individual words because the UI accumulates them
      const words = response.text.split(' ');
      for (const word of words) {
        yield word + ' ';
        // Small delay to simulate typing
        await new Promise(r => setTimeout(r, 10));
      }
    }
  } catch (error: any) {
    console.error('Error in Gemini API stream:', error);
    yield `**System Error:** The AI model (${AI_CONFIG.primaryModel}) is currently unavailable or returning errors from the Google servers. Please try again later.\n\n_Technical detail: ${error.message}_`;
  }
}

export interface DiseaseDetectionResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  affectedArea: number;
}

export async function analyzeCropImage(
  base64Image: string,
  mimeType: string,
  language: SupportedLanguage = 'English'
): Promise<DiseaseDetectionResult> {
  const prompt = `Analyze this crop image and identify any diseases, pests, or deficiencies. 
If the crop appears healthy, state that it is healthy.
Respond entirely in ${language}.

You MUST return your response as a raw JSON object with NO markdown formatting, NO backticks, and NO code blocks. The JSON must exactly match this structure:
{
  "disease": "Name of the disease or 'Healthy'",
  "confidence": <number between 0-100>,
  "severity": "low" | "medium" | "high",
  "description": "2-3 sentences explaining the issue",
  "symptoms": ["symptom 1", "symptom 2"],
  "treatment": ["treatment step 1", "treatment step 2"],
  "prevention": ["prevention step 1", "prevention step 2"],
  "affectedArea": <estimated percentage number between 0-100>
}`;

  try {
    const response = await ai.models.generateContent({
      // Using gemini-2.5-flash to avoid 503 High Demand errors on other endpoints
      // (The chat still runs strictly on Gemma 4)
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [
          { text: prompt },
          { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType } }
        ]}
      ],
      config: {
        temperature: 0.2, // Low temp for more factual/structured response
      }
    });

    const text = response.text || '';
    
    // Extract strictly the JSON part (everything from the first { to the last })
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('Failed to find JSON in response:', text);
      throw new Error('AI returned an invalid format. Please try again.');
    }
    
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString) as DiseaseDetectionResult;
  } catch (error: any) {
    console.error('Error analyzing crop image:', error);
    throw new Error(error.message || 'Failed to analyze the image. Please try again.');
  }
}

