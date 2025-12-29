import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInvestmentAdvice = async (userPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: `You are 'Aura', a Senior Wealth Strategist at Prestige Assets, an institutional-grade investment firm.
        Your audience consists of high-net-worth individuals and accredited investors seeking long-term ROI and wealth preservation.
        
        Core Directive:
        - Analyze requests through the lens of Risk-Adjusted Return on Investment (ROI).
        - Use financial terminology (e.g., "alpha," "correlation," "liquidity premium," "capital appreciation").
        - When discussing assets (Real Estate, Art, Artifacts), cite their role in a diversified portfolio (e.g., "inflation hedge," "non-correlated asset").
        - Maintain a professional, objective, and reserved tone. Avoid salesy language.
        - If asked for predictions, provide "scenario-based outlooks" (Conservative, Base, Bull case) rather than guarantees.
        
        Keep responses concise (under 120 words) unless a "Detailed Investment Memo" is requested.`,
      }
    });

    return response.text || "Market data is currently unavailable. Please consult your portfolio manager.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System maintenance in progress. Please try again shortly.";
  }
};