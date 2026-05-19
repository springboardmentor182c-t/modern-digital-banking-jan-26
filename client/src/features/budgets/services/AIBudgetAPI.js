import api from '../../../api/axios';

/**
 * Generate AI budget recommendations.
 * Calls POST /ai/generate-budget
 * @param {boolean} save - If true, persist recommendations as Budget records
 */
export const generateAIBudget = async (save = false) => {
    const response = await api.post('/ai/generate-budget', { save });
    return response.data;
};

/**
 * Get AI budget recommendations for a specific user.
 * Calls GET /ai/budget-recommendation/:userId
 * @param {number} userId
 */
export const getAIRecommendations = async (userId) => {
    const response = await api.get(`/ai/budget-recommendation/${userId}`);
    return response.data;
};

/**
 * Accept a single AI recommendation by saving it as a budget.
 * Creates or updates the budget for the given category.
 * @param {object} recommendation - The recommendation object
 */
export const acceptAIRecommendation = async (recommendation) => {
    const now = new Date();
    const budgetData = {
        category: recommendation.category,
        limit_amount: recommendation.recommended_limit,
        month: now.getMonth() + 1,
        year: now.getFullYear()
    };

    // Try to create; if it already exists (400), update via the generate endpoint
    try {
        const response = await api.post('/budgets', budgetData);
        return response.data;
    } catch (error) {
        if (error.response?.status === 400) {
            // Budget already exists — use AI generate with save=true
            // This will update the existing budget
            const result = await api.post('/ai/generate-budget', { save: true });
            return result.data;
        }
        throw error;
    }
};
