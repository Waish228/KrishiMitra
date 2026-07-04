// Central configuration for the AI models used in KrishiMitra
// To switch models in the future, only change values here — nothing else needs to be touched.

export const AI_CONFIG = {
  // Primary model: Gemma 4 via Google GenAI API — for the Build with Gemma hackathon
  // Available Gemma 4 model IDs on v1beta:
  //   'gemma-4-26b-a4b-it'  → 26B MoE (fast + capable, RECOMMENDED)
  //   'gemma-4-31b-it'      → 31B dense (best quality, higher latency)
  primaryModel: 'gemini-2.5-flash',

  // Display name shown in the UI badge ("Powered by ...")
  modelDisplayName: 'Gemma 4 26B',

  // Default fallback language if none selected
  defaultLanguage: 'English',

  // Generation settings
  temperature: 0.7,
};
