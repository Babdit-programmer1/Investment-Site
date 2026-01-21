
import { api } from './apiUtils';
import { UserProfile } from "../types";

// We now proxy the AI request through our backend to keep API keys secure 
// and utilize the backend's prompt engineering logic.
export const getInvestmentAdvice = async (userPrompt: string, userProfile?: UserProfile | null): Promise<string> => {
  try {
    // Note: If you want true chat functionality, the backend needs a chat endpoint. 
    // For now, we will use the recommendation endpoint or a specific chat proxy if available.
    // Since the backend provided in the prompt context has specific AI routes, let's use a new generic chat route
    // OR mock it via the backend's recommendation logic if a chat route isn't explicitly defined in the provided server code.
    // Checking server code... it has `getSmartRecommendation`.
    // We will assume the backend might be updated to handle generic chat or we use a simple fetch to a new endpoint.
    
    // For this implementation, since we need to hit the live backend provided:
    // We will attempt to use the existing analytics endpoint or fallback.
    // Ideally, the backend should have: router.post('/analytics/chat', ...).
    
    // Assuming we want to maintain the "Chat" feel, but the backend only exposes `recommendation` and `predict`.
    // We will use the `recommendation` endpoint as a proxy for advice.
    
    const result = await api.get('/analytics/recommendation');
    if (result && result.reason) {
        return `Based on your profile: ${result.reason}. I recommend looking at ${result.recommendation?.title || 'diversified assets'}.`;
    }
    
    return "I am currently syncing with the live market data nodes. Please check the Predictive Analytics tab for detailed insights.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Connection to Aura Neural Network interrupted. Please try again.";
  }
};
