
import { GoogleGenAI, Type, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";

// SAFETY SETTINGS
const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// Robust Retry with Fast Fail on 429
async function retry<T>(fn: () => Promise<T>, retries = 1, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        console.warn('Gemini 429 Quota Exceeded. Failing fast to fallback.');
        throw error;
    }
    if (error?.status === 400 || error?.status === 403) {
        throw error;
    }
    
    console.warn(`Gemini API Call Failed. Retrying... (${retries} left)`);
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return retry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

// --- FALLBACK ROUTES (Internal Knowledge Base) ---
const getLocalFallbackRoute = (startPoint: string, language: string) => {
    const isRu = language === 'RU';
    const startLower = (startPoint || '').toLowerCase();

    let stops = [
        { name: isRu ? "Тбилиси (Старт)" : "Tbilisi (Start)", coordinates: { lat: 41.7151, lng: 44.8271 }, type: "CULTURE", description: isRu ? "Выезд из города." : "Departure from city.", driveTimeFromPrev: "0" },
        { name: isRu ? "Джвари" : "Jvari Monastery", coordinates: { lat: 41.8384, lng: 44.7335 }, type: "CULTURE", description: "UNESCO Heritage.", driveTimeFromPrev: "40 min" },
        { name: isRu ? "Ананури" : "Ananuri Fortress", coordinates: { lat: 42.1642, lng: 44.7042 }, type: "CULTURE", description: "Complex on the Aragvi River.", driveTimeFromPrev: "45 min" },
        { name: isRu ? "Тбилиси (Финиш)" : "Tbilisi (Finish)", coordinates: { lat: 41.7151, lng: 44.8271 }, type: "FOOD", description: "Return.", driveTimeFromPrev: "1h 30m" }
    ];

    let distance = 160;

    if (startLower.includes('kutaisi')) {
        stops = [
            { name: isRu ? "Кутаиси (Старт)" : "Kutaisi (Start)", coordinates: { lat: 42.2662, lng: 42.7180 }, type: "CULTURE", description: "Start.", driveTimeFromPrev: "0" },
            { name: isRu ? "Пещера Прометея" : "Prometheus Cave", coordinates: { lat: 42.3767, lng: 42.6008 }, type: "NATURE", description: "Cave.", driveTimeFromPrev: "30 min" },
            { name: isRu ? "Каньон Мартвили" : "Martvili Canyon", coordinates: { lat: 42.4573, lng: 42.3776 }, type: "NATURE", description: "Canyon.", driveTimeFromPrev: "1h" },
            { name: isRu ? "Кутаиси (Финиш)" : "Kutaisi (Finish)", coordinates: { lat: 42.2662, lng: 42.7180 }, type: "FOOD", description: "Finish.", driveTimeFromPrev: "1h" }
        ];
        distance = 120;
    } else if (startLower.includes('batumi')) {
        stops = [
            { name: isRu ? "Батуми (Старт)" : "Batumi (Start)", coordinates: { lat: 41.6168, lng: 41.6367 }, type: "SEA", description: "Start.", driveTimeFromPrev: "0" },
            { name: isRu ? "Ботанический Сад" : "Botanical Garden", coordinates: { lat: 41.6936, lng: 41.7075 }, type: "NATURE", description: "Garden.", driveTimeFromPrev: "20 min" },
            { name: isRu ? "Петра" : "Petra Fortress", coordinates: { lat: 41.7667, lng: 41.7500 }, type: "CULTURE", description: "Fortress.", driveTimeFromPrev: "30 min" },
            { name: isRu ? "Батуми (Финиш)" : "Batumi (Finish)", coordinates: { lat: 41.6168, lng: 41.6367 }, type: "FOOD", description: "Finish.", driveTimeFromPrev: "40 min" }
        ];
        distance = 50;
    }

    return {
        stops: stops as any[],
        totalDistance: distance,
        totalDuration: "5-6 Hours",
        summary: isRu ? "Классический маршрут (AI Offline)." : "Classic route (AI Offline)."
    };
};

export const sendChatMessage = async (history: any[], message: string, imageBase64?: string, imageMime?: string, userLocation: string = 'Tbilisi') => {
  return retry(async () => {
    // FIXED: Exclusively using process.env.API_KEY for initialization with fallback string
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const systemInstruction = `You are "OrbiTrip AI". Help tourists in Georgia. Current Location: ${userLocation}.`;
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction, tools: [{ googleMaps: {} }], safetySettings: SAFETY_SETTINGS },
        history: history
    });
    let msgContent: any = message;
    if (imageBase64 && imageMime) {
        msgContent = { parts: [{ inlineData: { data: imageBase64, mimeType: imageMime } }, { text: message }] };
    }
    const response = await chat.sendMessage({ message: msgContent });
    return { text: response.text, groundingMetadata: response.candidates?.[0]?.groundingMetadata };
  });
};

export const searchTravelInfo = async (prompt: string, language: string) => {
  return retry(async () => {
    // FIXED: Exclusively using process.env.API_KEY for initialization with fallback string
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: `Find: ${prompt}. Lang: ${language}.`,
        config: { tools: [{ googleMaps: {} }], safetySettings: SAFETY_SETTINGS },
    });
    return { text: response.text || "No info.", sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [], isMap: true };
  });
};

export const generateAudioGuide = async (text: string, language: string) => {
    // FIXED: Exclusively using process.env.API_KEY for initialization with fallback string
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text: text.substring(0, 1000) }] },
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const planTripWithAi = async (params: { startPoint: string, duration: string, interests: string, wishes: string, knownLocations: string }, language: string) => {
    // FIXED: Exclusively using process.env.API_KEY for initialization with fallback string
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    if (!params.startPoint) return getLocalFallbackRoute('Tbilisi', language);

    const promptBase = `
      Act as "OrbiTrip Guide". Create driving route from ${params.startPoint}.
      WISHES: "${params.interests} ${params.wishes}"
      LANG: ${language}
      
      JSON SCHEMA:
      {
        "stops": [
          { "name": "Start City", "coordinates": { "lat": 41.71, "lng": 44.82 }, "type": "CULTURE", "description": "Start.", "driveTimeFromPrev": "0 min" },
          { "name": "Point 1", "coordinates": { "lat": 0.0, "lng": 0.0 }, "type": "NATURE", "description": "150 words details.", "driveTimeFromPrev": "45 min" },
          { "name": "End City", "coordinates": { "lat": 41.71, "lng": 44.82 }, "type": "OTHER", "description": "Finish.", "driveTimeFromPrev": "1h" }
        ],
        "totalDistance": 150,
        "totalDuration": "6 Hours",
        "summary": "Short summary."
      }
    `;

    try {
        const response = await retry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: promptBase,
                config: { tools: [{ googleMaps: {} }], safetySettings: SAFETY_SETTINGS } as any
            });
        }, 0); 

        if (response.text) {
            return parseAiJson(response.text, params.startPoint);
        }
        throw new Error("Empty AI Response");

    } catch (err: any) {
        if (err.status === 429 || err.message?.includes('RESOURCE_EXHAUSTED')) {
             console.warn("Gemini Quota Exhausted (429). Switching to internal knowledge base immediately.");
             return getLocalFallbackRoute(params.startPoint, language);
        }

        console.warn("AI Planner Tool Error. Trying Internal Knowledge.", err.message);
        
        try {
            const fallbackPrompt = promptBase + `\n\nIMPORTANT: Do not use tools. Use internal knowledge for coordinates.`;
            const response2 = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fallbackPrompt,
                config: { safetySettings: SAFETY_SETTINGS } as any
            });
            
            if (response2.text) {
                return parseAiJson(response2.text, params.startPoint);
            }
        } catch (fatalErr) {
            console.error("AI Planner Fatal Error:", fatalErr);
            return getLocalFallbackRoute(params.startPoint, language);
        }
    }
    return getLocalFallbackRoute(params.startPoint, language);
};

const parseAiJson = (text: string, startPoint: string) => {
    try {
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const first = cleanText.indexOf('{');
        const last = cleanText.lastIndexOf('}');
        if (first !== -1 && last !== -1) cleanText = cleanText.substring(first, last + 1);
        
        const parsed = JSON.parse(cleanText);
        
        if (!parsed.stops || !Array.isArray(parsed.stops)) throw new Error("Invalid structure");
        
        parsed.stops = parsed.stops.map((s: any) => {
            if (!s.coordinates || !s.coordinates.lat) {
                return { ...s, coordinates: { lat: 41.7151, lng: 44.8271 } };
            }
            return s;
        });
        
        if (parsed.stops.length > 1) {
             const first = parsed.stops[0];
             const last = parsed.stops[parsed.stops.length - 1];
             if (first.name !== last.name && !last.name.includes(startPoint)) {
                 parsed.stops.push({ ...first, description: "Return trip.", type: "OTHER" });
                 parsed.totalDistance = (parsed.totalDistance || 100) + 50;
             }
        }

        return parsed;
    } catch (e) {
        throw new Error("JSON Parse Failed");
    }
};

export const generateTourImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  try {
      const width = size === "4K" ? 3840 : 1280;
      const height = size === "4K" ? 2160 : 720;
      const seed = Math.floor(Math.random() * 100000);
      const encoded = encodeURIComponent(prompt + " , realistic, 8k, georgia travel");
      return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;
  } catch (e) {
      return 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80';
  }
};

export const editTourImage = async (base64Image: string, prompt: string, mimeType: string) => {
  // FIXED: Exclusively using process.env.API_KEY for initialization with fallback string
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ inlineData: { data: base64Image, mimeType } }, { text: prompt }] },
    config: { safetySettings: SAFETY_SETTINGS }
  });
  
  // FIXED: Correctly iterate through parts to find the image part as per nano banana series guidelines
  for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
          if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
          }
      }
  }
  throw new Error("Image editing failed");
};

export const analyzeTourImage = async (base64Image: string, mimeType: string, language: string) => {
  // FIXED: Exclusively using process.env.API_KEY for initialization with fallback string
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    // FIXED: Switched to gemini-3-flash-preview for vision task
    model: 'gemini-3-flash-preview', 
    contents: { parts: [{ inlineData: { data: base64Image, mimeType } }, { text: `Analyze location. Lang: ${language}.` }] },
    config: { safetySettings: SAFETY_SETTINGS }
  });
  return response.text;
};

export const generateVeoVideo = async (prompt: string, base64Image?: string, mimeType?: string, aspectRatio: "16:9" | "9:16" = "16:9") => {
  // FIXED: Exclusively using process.env.API_KEY for initialization with fallback string
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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
  // FIXED: Using process.env.API_KEY for media download
  const res = await fetch(`${link}&key=${process.env.API_KEY}`);
  return URL.createObjectURL(await res.blob());
};

export const generateTourPrices = async (tourDescription: string) => {
    // FIXED: Exclusively using process.env.API_KEY for initialization with fallback string
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
        // FIXED: Switched to gemini-3-flash-preview for text analysis and added responseSchema
        model: 'gemini-3-flash-preview',
        contents: `Estimate prices for Sedan, Minivan, Bus: "${tourDescription}".`,
        config: { 
            responseMimeType: "application/json", 
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        vehicle: { type: Type.STRING, description: "Vehicle type (Sedan, Minivan, Bus)" },
                        price: { type: Type.STRING, description: "Estimated price string (e.g. 150 GEL)" },
                        guests: { type: Type.STRING, description: "Capacity range (e.g. 1-4)" }
                    },
                    required: ["vehicle", "price", "guests"]
                }
            },
            safetySettings: SAFETY_SETTINGS 
        }
    });
    return JSON.parse(response.text || "[]");
};
