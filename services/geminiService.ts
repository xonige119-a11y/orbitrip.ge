import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  // Strictly check for missing or undefined string key
  if (!apiKey || apiKey === 'undefined' || apiKey.length < 5) {
      console.warn("Google GenAI API Key is missing or invalid in environment.");
      // We throw a specific error that can be caught
      throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

// Pricing Logic Instruction
const PRICING_CONTEXT = `
  You are an expert Pricing Engine for "OrbiTrip Georgia".
  VEHICLE TYPES: Sedan ($20+$0.4/km), Minivan ($30+$0.6/km), Bus ($50+$0.9/km).
`;

// Helper for retries with better error logging
async function retry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // If it's a key missing error, do not retry, fail immediately
    if (error.message === 'API_KEY_MISSING') throw error;
    
    console.error(`Gemini API Call Failed: ${error.message || error}`);
    if (retries > 0) {
      console.warn(`Retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, 1000));
      return retry(fn, retries - 1);
    }
    throw error;
  }
}

// 1. Chatbot Logic & Planner
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string, language: string) => {
  return retry(async () => {
    const ai = getAiClient();
    
    // Updated Context specifically for OrbiTrip Platform
    const systemInstruction = `You are "Dato", the lead travel architect for OrbiTrip Georgia.
    
    ABOUT ORBITRIP:
    - We provide private drivers with cars (Sedans, Minivans).
    - We are NOT a bus schedule or public transport.
    - Key Benefit: "Stop anywhere for free". Customers can pause for photos, food, or breaks anytime.
    - Pricing is fixed per route, not per person.
    
    YOUR GOAL:
    - Create logical, comfortable driving itineraries.
    - Don't suggest routes that are impossible in one day (e.g. Batumi to Kazbegi is too far for a day trip).
    - Always output valid JSON when requested.
    
    JSON FORMAT REQUIRED:
    {"stops": ["StartCity", "Stop1", "Stop2", "EndCity"], "totalDistance": 150, "duration": "5 Hours", "reasoning": "Short description why this fits"}
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction },
      history: history
    });

    const response = await chat.sendMessage({ message });
    if (!response.text) throw new Error("Empty response from AI");
    return response.text;
  });
};

// 2. Search Travel Info
export const searchTravelInfo = async (prompt: string, language: string) => {
  return retry(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Search for travel info: ${prompt}. Answer in ${language === 'RU' ? 'Russian' : 'English'}.`,
        config: { tools: [{googleSearch: {}}] },
    });
    return { text: response.text || "No info found.", sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  });
};

// 3. Generate Image
export const generateTourImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { imageSize: size, aspectRatio: "1:1" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image generated.");
};

// 4. Edit Image
export const editTourImage = async (base64Image: string, prompt: string, mimeType: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ inlineData: { data: base64Image, mimeType } }, { text: prompt }] },
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No edited image generated.");
};

// 5. Analyze Image
export const analyzeTourImage = async (base64Image: string, mimeType: string, language: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: base64Image, mimeType } }, { text: `Analyze this image. Answer in ${language === 'RU' ? 'Russian' : 'English'}.` }] },
  });
  return response.text;
};

// 6. Generate Video
export const generateVeoVideo = async (prompt: string, base64Image?: string, mimeType?: string, aspectRatio: "16:9" | "9:16" = "16:9") => {
  const ai = getAiClient();
  const model = 'veo-3.1-fast-generate-preview';
  let operation;
  const config = { numberOfVideos: 1, resolution: '720p', aspectRatio };

  if (base64Image && mimeType) {
    operation = await ai.models.generateVideos({ model, prompt: prompt || "Animate", image: { imageBytes: base64Image, mimeType }, config });
  } else {
    operation = await ai.models.generateVideos({ model, prompt, config });
  }

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }
  
  const link = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!link) throw new Error("Video failed");
  
  const res = await fetch(`${link}&key=${process.env.API_KEY}`);
  return URL.createObjectURL(await res.blob());
};

// 7. Generate Prices
export const generateTourPrices = async (tourDescription: string) => {
    return retry(async () => {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Estimate prices for: "${tourDescription}" based on ${PRICING_CONTEXT}. Return JSON array of 3 objects {vehicle, price, guests}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { vehicle: { type: Type.STRING }, price: { type: Type.STRING }, guests: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};