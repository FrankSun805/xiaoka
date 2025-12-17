import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface CardAnalysis {
  name: string;
  group: string;
  vibe: string;
  rarityScore: number; // 1-100, used to determine rarity
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
            text: "Analyze this K-pop/Idol photocard image. Identify the likely name and group (guess if unsure). Describe the visual 'vibe' in 3-4 words (e.g., 'Dreamy, Ethereal, Soft'). Assign a rarity score from 1-100 based on how cool/artistic it looks."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the person" },
            group: { type: Type.STRING, description: "Group name" },
            vibe: { type: Type.STRING, description: "Short aesthetic description" },
            rarityScore: { type: Type.INTEGER, description: "1 to 100" }
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
    // Fallback
    return {
      name: "Unknown Star",
      group: "Solo",
      vibe: "Mysterious, Cool",
      rarityScore: 50
    };
  }
};