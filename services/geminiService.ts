import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI with process.env.API_KEY as mandated by guidelines.
// We assume process.env.API_KEY is available and valid in the execution context.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface CardAnalysis {
  name: string;
  group: string;
  vibe: string;
  rarityScore: number; 
}

export const analyzeCardImage = async (base64Image: string): Promise<CardAnalysis> => {
  // Strip prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          {
            text: "Analyze this K-pop/Idol photocard image."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            group: { type: Type.STRING },
            vibe: { type: Type.STRING },
            rarityScore: { type: Type.INTEGER }
          },
          required: ["name", "group", "vibe", "rarityScore"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CardAnalysis;
    }
    throw new Error("No response text");

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      name: "Unknown Star",
      group: "Solo",
      vibe: "Mysterious, Cool",
      rarityScore: 50
    };
  }
};