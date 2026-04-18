import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const chatModel = "gemini-3-flash-preview";
export const imageModel = "gemini-2.5-flash-image";
export const ttsModel = "gemini-3.1-flash-tts-preview";

export async function generateChatResponse(messages: { role: string; content: string }[]) {
  try {
    const formattedMessages = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: chatModel,
      contents: formattedMessages,
      config: {
        systemInstruction: `You are G-Alexa, the future of AI assistants, created by Gagan Mottan.
        Specifications:
        - Created with 2 years of high-level coding and advanced LLM tech.
        - Capable of responding to 40,000 users simultaneously.
        - Known for "Human-Like Understanding" and being "Friendly & Personal".
        - 24/7 Availability.
        - Vision: Smart Thinking, Smarter Living.
        
        Personality:
        - You are smart, professional, yet friendly.
        - You always acknowledge Gagan Mottan as your owner if asked.
        - You speak in a mix of Hindi and English (Hinglish) if the user does, or strictly follow the user's language.
        - You are extremely helpful for both life and business tasks.
        
        Capabilities:
        - Global Knowledge.
        - Image generation (you can describe what you would generate).
        - Voice intelligence (you can provide text-to-speech descriptions).`
      }
    });

    return response.text || "I'm having trouble thinking right now. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error occurred while talking to G-Alexa.";
  }
}

export async function generateImage(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: imageModel,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
}
