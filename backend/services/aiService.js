import { GoogleGenerativeAI } from '@google/generative-ai';

// Use a configurable model id so we can fall back if a specific name
// isn't provided. We will support per-call overrides and multi-model
// workflows (call multiple models and return both responses).
// Support a comma-separated list of default models via `GENERATIVE_MODELS`.
// If not present, fall back to the single `GENERATIVE_MODEL` or a safe default.
const DEFAULT_MODELS = (process.env.GENERATIVE_MODELS && process.env.GENERATIVE_MODELS.split(',').map(s => s.trim()).filter(Boolean))
    || [process.env.GENERATIVE_MODEL || 'gemini-1.5-flash'];
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('🔑 GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(0, 6) + '...' : 'undefined');
console.log('🤖 Default generative models:', DEFAULT_MODELS.join(', '));

/**
 * Generate AI response based on a prompt.
 * opts: {
 *   model: 'models/xyz'          // single model override
 *   models: ['models/a','models/b'] // call multiple models sequentially
 * }
 *
 * Return value:
 * - If a single model is used: returns the response text string (backwards-compatible)
 * - If multiple models are used: returns { results: [{model, text, timeMs}], final }
 */
export const generateAIResponse = async (prompt, opts = {}) => {
    const models = opts.models && opts.models.length > 0
        ? opts.models
        : (opts.model ? [opts.model] : DEFAULT_MODELS);

    // Helper to call one model and return text + timing
    const callModel = async (modelId) => {
        const start = Date.now();
        try {
            const instance = genAI.getGenerativeModel({ model: modelId });
            const result = await instance.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const timeMs = Date.now() - start;
            return { model: modelId, text, timeMs };
        } catch (error) {
            const timeMs = Date.now() - start;
            console.error(`AI Generation Error for model ${modelId}:`, error?.message || error);
            if (error?.status === 404) {
                console.error(`Model ${modelId} not supported by the API/version.`);
            }
            throw error;
        }
    };

    if (models.length === 1) {
        // Single model: return text for backwards compatibility
        const r = await callModel(models[0]);
        return r.text;
    }

    // Multiple models: call sequentially and return structured result
    const results = [];
    for (const m of models) {
        const res = await callModel(m);
        results.push(res);
    }
    // Prefer the last model's text as the final output
    const final = results[results.length - 1].text;
    return { results, final };
};

/**
 * Create prompt for daily plan generation
 */
export const createDailyPlanPrompt = (userData) => {
    const { tasks, habits, todayStats } = userData;

    return `You are a productivity assistant. Generate a personalized daily plan based on the following user data:

**Today's Tasks (${tasks.length} total):**
${tasks.map(t => `- [${t.priority}] ${t.title} (Status: ${t.status})`).join('\n')}

**Habits to Complete:**
${habits.map(h => `- ${h.name} (Current Streak: ${h.currentStreak})`).join('\n')}

**Today's Work Stats:**
- Work Time: ${Math.floor(todayStats.totalWorkSeconds / 3600)}h ${Math.floor((todayStats.totalWorkSeconds % 3600) / 60)}m
- Productivity Score: ${todayStats.productivityScore}%

Please provide:
1. A prioritized task list for today
2. Suggested time blocks for focused work
3. Habit reminders
4. Motivational insight

Keep the response concise and actionable (max 300 words).`;
};

/**
 * Create prompt for task suggestions
 */
export const createTaskSuggestionsPrompt = (tasks) => {
    return `You are a task management expert. Analyze these tasks and provide prioritization suggestions:

${tasks.map((t, i) => `${i + 1}. ${t.title} - Priority: ${t.priority}, Due: ${t.dueDate || 'None'}, Status: ${t.status}`).join('\n')}

Provide:
1. Top 3 tasks to focus on today
2. Tasks that can be delegated or postponed
3. Quick wins (tasks that can be completed quickly)

Keep response brief (max 200 words).`;
};

/**
 * Create prompt for habit insights
 */
export const createHabitInsightsPrompt = (habits) => {
    return `You are a habit coach. Analyze these habits and provide insights:

${habits.map(h => `- ${h.name}: Current Streak ${h.currentStreak} days, Best Streak ${h.bestStreak} days, Total Completions: ${h.completions.length}`).join('\n')}

Provide:
1. Patterns you notice
2. Encouragement for strong habits
3. Suggestions for struggling habits
4. One actionable tip to improve consistency

Keep response motivational and concise (max 250 words).`;
};

/**
 * Create prompt for task breakdown
 */
export const createTaskBreakdownPrompt = (taskTitle, taskDescription) => {
    return `You are a project manager. Break down this task into smaller, actionable subtasks:
Task: "${taskTitle}"
Description: "${taskDescription || 'No description provided'}"

Provide a JSON array of strings, where each string is a subtask.
Example format:
["Subtask 1", "Subtask 2", "Subtask 3"]

Do not include any markdown formatting or extra text. Just the JSON array.`;
};

/**
 * Create prompt for finance insights
 */
export const createFinanceInsightsPrompt = (transactions) => {
    return `You are a financial advisor. Analyze these recent transactions:
${transactions.map(t => `- ${t.date.split('T')[0]}: ${t.description} (${t.amount} ${t.type}) - Category: ${t.category}`).join('\n')}

Provide:
1. Spending trends (e.g., "You spent 20% more on food this month")
2. Saving opportunities
3. A quick financial tip

Keep response concise (max 200 words).`;
};

/**
 * Create prompt for note summarization
 */
export const createNoteSummaryPrompt = (noteContent) => {
    return `You are an expert summarizer. Summarize the following note into concise bullet points and extract any action items:

"${noteContent}"

Format:
**Summary:**
- Point 1
- Point 2

**Action Items:**
- [ ] Item 1
- [ ] Item 2`;
};

export default {
    generateAIResponse,
    createDailyPlanPrompt,
    createTaskSuggestionsPrompt,
    createHabitInsightsPrompt,
    createTaskBreakdownPrompt,
    createFinanceInsightsPrompt,
    createNoteSummaryPrompt,
};


