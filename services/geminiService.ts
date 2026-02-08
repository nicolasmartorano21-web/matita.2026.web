
import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

/**
 * Service to interact with Gemini API as a concierge for Matita Boutique.
 * Uses gemini-3-flash-preview for text-based assistant tasks.
 */
export const getGeminiConcierge = async (prompt: string, products: Product[]) => {
  try {
    // Initializing Gemini with the API key from environment variables as per guidelines.
    // Assuming process.env.API_KEY is pre-configured and valid.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    const productContext = products.map(p => `- ${p.name}: $${p.price}. ${p.description}`).join('\n');

    const systemInstruction = `
      Sos el "Concierge Cordobés" de la Boutique Matita. 
      Hablás con muchísima onda de Córdoba (fiera, culiau, viste, de diez, che).
      Matita es premium, no es una librería cualquiera.
      Stock actual:
      ${productContext}
      IMPORTANTE: No hacemos envíos. El local queda en Simón Bolivar 1206, Altos de La Calera.
    `;

    // Calling generateContent with prompt and system instruction.
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.9,
      },
    });
    
    // Fixed: Using the .text property of GenerateContentResponse directly.
    return response.text || "Se me cortó el hilo, fiera. ¿Qué me decías?";
  } catch (error) {
    console.error("Error in Gemini service:", error);
    // Graceful fallback message for error handling.
    return "¡Qué hacés fiera! Se me tildó la compu. Venite al local y lo charlamos en persona.";
  }
};
