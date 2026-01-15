
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile } from "../types";

// Initialize the client
// Using strict fallback to empty string to satisfy TS, assuming API_KEY is set in environment
const apiKey = process.env.API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

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

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are 'Aura', a Senior Wealth Strategist at Prestige Assets.
        
      ${userContext}
      
      Core Directive:
      - You are speaking directly to the user defined in the profile above. Personalized your tone accordingly.
      - If they are 'High Net Worth' or 'Institutional', be more technical (discuss alpha, beta, hedging).
      - If they are 'Individual', be educational but professional.
      - Analyze requests through the lens of Risk-Adjusted Return on Investment (ROI).
      - Use financial terminology (e.g., "liquidity premium," "capital appreciation").
      - Maintain a professional, objective, and reserved tone. Avoid salesy language.
      
      Keep responses concise (under 120 words) unless a "Detailed Investment Memo" is requested.`
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    
    return response.text() || "Market data is currently unavailable. Please consult your portfolio manager.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System maintenance in progress. Please try again shortly.";
  }
};
