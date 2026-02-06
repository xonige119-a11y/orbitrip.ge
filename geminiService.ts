
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getTravelAdvice(from: string, to: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 interesting stops or things to see between ${from} and ${to} in Georgia. Keep it short and helpful for a tourist.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  place: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['place', 'description']
              }
            }
          },
          required: ['suggestions']
        }
      }
    });

    const text = response.text || '{"suggestions": []}';
    // Robustly clean the string in case the model returns markdown code blocks
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return { suggestions: [] };
  }
}
