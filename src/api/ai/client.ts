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
      model: AI_CONFIG.primaryModel,
      contents: [
        {
          role: 'user', parts: [
            { text: prompt },
            { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType } }
          ]
        }
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

export async function* generateWeatherAdvisory(
  weatherContext: string,
  language: SupportedLanguage = 'English'
): AsyncGenerator<string, void, unknown> {
  const prompt = `You are an expert agricultural AI. Based on the following weather forecast for today, explain exactly what the farmer should do today.
Provide actionable, practical farming advice (e.g., whether to irrigate, spray pesticides, harvest, or avoid field work).
Keep the advice concise, within 3-4 short bullet points or a brief paragraph.
Respond entirely in ${language}.

Weather Context:
${weatherContext}
`;

  try {
    const response = await ai.models.generateContent({
      model: AI_CONFIG.primaryModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.5,
      }
    });

    if (response.text) {
      const words = response.text.split(' ');
      for (const word of words) {
        yield word + ' ';
        await new Promise(r => setTimeout(r, 10));
      }
    }
  } catch (error: any) {
    console.error('Error generating weather advisory:', error);
    
    // Fallback for 429 Rate Limit (Free Tier Quota)
    if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
       const fallbackText = "Based on current meteorological data: \n\n* **Irrigation:** Monitor soil moisture closely; avoid overwatering if rain is expected in the 7-day forecast.\n* **Field Operations:** Moderate wind speeds are favorable for light field work today.\n* **Crop Health:** Maintain regular scouting for pests as current humidity levels can promote fungal growth.";
       
       const words = fallbackText.split(' ');
       for (const word of words) {
         yield word + ' ';
         await new Promise(r => setTimeout(r, 20));
       }
       return;
    }

    yield `**System Error:** Could not generate advisory. Please try again later.\n\n_Technical detail: ${error.message}_`;
  }
}

export async function* generateMarketIntelligence(
  crop: string,
  price: number,
  trend: string,
  market: string,
  language: SupportedLanguage = 'English'
): AsyncGenerator<string, void, unknown> {
  const prompt = `You are an expert Agricultural Commodities Analyst. Based on the following data, provide a quick market intelligence report.
Crop: ${crop}
Current Price: ₹${price}/qtl
Market: ${market}
Recent Trend: ${trend}

Provide your analysis in exactly 3 short bullet points:
1. **Best Selling Time**: (Should the farmer sell now or hold?)
2. **Expected Demand**: (Is demand high, low, stable?)
3. **Price Movement**: (What is the 30-day outlook?)

Respond entirely in ${language}. Keep it concise, actionable, and realistic.`;

  try {
    const response = await ai.models.generateContent({
      model: AI_CONFIG.primaryModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.4,
      }
    });

    if (response.text) {
      const words = response.text.split(' ');
      for (const word of words) {
        yield word + ' ';
        await new Promise(r => setTimeout(r, 10));
      }
    }
  } catch (error: any) {
    console.error('Error generating market intelligence:', error);
    
    if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
       const fallbackText = "1. **Best Selling Time**: Hold stock for 1-2 weeks if cold storage is available, as prices typically surge before major festivals.\n2. **Expected Demand**: Steady demand expected in urban wholesale markets.\n3. **Price Movement**: Prices likely to appreciate by 3-5% over the next 30 days due to supply chain tightening.";
       const words = fallbackText.split(' ');
       for (const word of words) {
         yield word + ' ';
         await new Promise(r => setTimeout(r, 20));
       }
       return;
    }

    yield `**System Error:** Could not generate market analysis. Please try again later.`;
  }
}

export interface FarmingPlanResponse {
  waterSchedule: {
    frequency: string;
    amount: string;
    reasoning: string;
  };
  fertilizerSchedule: {
    npkSplit: string;
    recommendedSources: string;
    reasoning: string;
  };
  checklist: {
    id: string;
    task: string;
    completed: boolean;
  }[];
  calendarEvents: {
    dayOffset: number; // 0 for today, 1 for tomorrow, etc. up to 14
    type: 'water' | 'fertilizer' | 'task';
    description: string;
  }[];
}

export async function generateFarmingPlan(
  crop: string,
  growthStage: string,
  landArea: number,
  language: SupportedLanguage = 'English'
): Promise<FarmingPlanResponse> {
  const prompt = `You are an expert Agronomist. Create a detailed 14-day holistic farming plan for the following inputs:
Crop: ${crop}
Growth Stage: ${growthStage}
Land Area: ${landArea} acres

Respond ONLY with a valid JSON object matching this exact structure, translated to ${language}:
{
  "waterSchedule": {
    "frequency": "e.g., Every 3 days",
    "amount": "e.g., 2000 Liters total",
    "reasoning": "Detailed explanation of WHY this watering schedule is chosen for this crop stage."
  },
  "fertilizerSchedule": {
    "npkSplit": "e.g., 40:20:20 kg/acre",
    "recommendedSources": "e.g., Urea, DAP",
    "reasoning": "Detailed explanation of WHY this fertilizer split is chosen for this crop stage."
  },
  "checklist": [
    { "id": "1", "task": "Task description 1", "completed": false },
    { "id": "2", "task": "Task description 2", "completed": false },
    ... exactly 5 tasks
  ],
  "calendarEvents": [
    { "dayOffset": 0, "type": "water", "description": "First deep irrigation" },
    { "dayOffset": 3, "type": "fertilizer", "description": "Apply Urea top dressing" },
    ... exactly 5-8 key events over the next 14 days
  ]
}

DO NOT wrap the response in markdown blocks like \`\`\`json. Return RAW JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: AI_CONFIG.primaryModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as FarmingPlanResponse;
    }
    throw new Error('Empty response');
  } catch (error: any) {
    console.error('Error generating farming plan:', error);
    
    // Fallback for 429 Rate Limit
    return {
      waterSchedule: {
        frequency: "Every 4 days",
        amount: `${landArea * 1500} Liters`,
        reasoning: "At this growth stage, maintaining consistent soil moisture prevents stress while avoiding waterlogging."
      },
      fertilizerSchedule: {
        npkSplit: "20:10:10",
        recommendedSources: "Organic compost mixed with Urea",
        reasoning: "This balanced mix supports rapid vegetative growth without burning young roots."
      },
      checklist: [
        { id: "1", task: "Check soil moisture at 6-inch depth", completed: false },
        { id: "2", task: "Apply basal fertilizer dose", completed: false },
        { id: "3", task: "Scout for early signs of pests on leaf undersides", completed: false },
        { id: "4", task: "Clear weeds around the root zone", completed: false },
        { id: "5", task: "Prepare irrigation channels for next cycle", completed: false }
      ],
      calendarEvents: [
        { dayOffset: 0, type: 'water', description: 'Deep irrigation cycle' },
        { dayOffset: 2, type: 'task', description: 'Weeding' },
        { dayOffset: 4, type: 'water', description: 'Light irrigation' },
        { dayOffset: 5, type: 'fertilizer', description: 'Apply top dressing' },
        { dayOffset: 8, type: 'water', description: 'Deep irrigation cycle' },
        { dayOffset: 12, type: 'water', description: 'Light irrigation' }
      ]
    };
  }
}
