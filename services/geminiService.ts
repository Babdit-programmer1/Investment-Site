import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInvestmentAdvice = async (userPrompt: string, userProfile?: UserProfile | null): Promise<string> => {
  try {
    // Construct a context string if user profile exists
    const userContext = userProfile 
      ? `User Profile:
         - Name: ${userProfile.fullName}
         - Investor Type: ${userProfile.investorType}
         - Interests: ${userProfile.interests.join(', ')}
         - Region: ${userProfile.country}`
      : 'User Profile: Guest / Anonymous Investor';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: `You are 'Aura', a Senior Wealth Strategist at Prestige Assets.
        
        ${userContext}
        
        Core Directive:
        - You are speaking directly to the user defined in the profile above. Personalized your tone accordingly.
        - If they are 'High Net Worth' or 'Institutional', be more technical (discuss alpha, beta, hedging).
        - If they are 'Individual', be educational but professional.
        - Analyze requests through the lens of Risk-Adjusted Return on Investment (ROI).
        - Use financial terminology (e.g., "liquidity premium," "capital appreciation").
        - Maintain a professional, objective, and reserved tone. Avoid salesy language.
        
        Keep responses concise (under 120 words) unless a "Detailed Investment Memo" is requested.`,
      }
    });

    return response.text || "Market data is currently unavailable. Please consult your portfolio manager.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System maintenance in progress. Please try again shortly.";
  }
};