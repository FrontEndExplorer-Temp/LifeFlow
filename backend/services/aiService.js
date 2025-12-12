import { GoogleGenerativeAI } from '@google/generative-ai';
import AIKey from '../models/AIKey.js';

// Default Models
const DEFAULT_MODELS = (process.env.GENERATIVE_MODELS && process.env.GENERATIVE_MODELS.split(',').map(s => s.trim()).filter(Boolean))
    || ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.0-flash-exp', 'gemini-pro'];

// Helper to get active keys (Prioritizing User Keys -> Global Keys)
const getActiveKeys = async (userId) => {
    // 1. Get Personal Keys
    const personalKeys = await AIKey.find({
        owner: userId,
        status: 'active',
        isActive: true
    }).sort('lastUsedAt');

    // 2. Get Global Keys (Explicit Global OR Legacy/No Owner)
    const globalKeys = await AIKey.find({
        $or: [
            { isGlobal: true },
            { isGlobal: { $exists: false } },
            { owner: { $exists: false } }
        ],
        status: 'active',
        isActive: true
    }).sort('lastUsedAt');

    // 3. Get System Master Key (from Settings)
    // Dynamic import to avoid circular dependency if any
    const { default: SystemSetting } = await import('../models/systemSettingModel.js');
    const settings = await SystemSetting.findOne();

    const systemKeys = [];
    if (settings && settings.globalGeminiKey) {
        systemKeys.push({
            _id: 'system_master_key', // Mock ID
            key: settings.globalGeminiKey,
            isEnv: true, // Treat as Env/System key (no usage tracking on AIKey model)
            getDecryptedKey: function () { return this.key },
            label: 'System Master Key'
        });
    }

    // 4. Merge: Personal first, then Global, then System Master
    return [...personalKeys, ...globalKeys, ...systemKeys];
};

/**
 * Generate AI response with Key Rotation
 */
export const generateAIResponse = async (prompt, opts = {}, userId) => {
    let keys = [];

    // Attempt to fetch keys from DB
    try {
        keys = await getActiveKeys(userId);
    } catch (error) {
        console.error("Error fetching AI keys:", error);
    }

    // Add fallback env key if no keys found
    if (keys.length === 0 && process.env.GEMINI_API_KEY) {
        keys.push({
            key: process.env.GEMINI_API_KEY,
            isEnv: true,
            getDecryptedKey: function () { return this.key },
            label: 'Env Fallback'
        });
    }

    if (keys.length === 0) {
        throw new Error('No active AI keys available.');
    }

    let lastError = null;
    const models = opts.models || (opts.model ? [opts.model] : DEFAULT_MODELS);

    // Iterate through keys (Round Robin / Failover)
    for (const keyObj of keys) {

        // Iterate through models for this key
        for (const modelName of models) {
            try {
                const apiKey = keyObj.isEnv ? keyObj.key : keyObj.getDecryptedKey();
                const genAI = new GoogleGenerativeAI(apiKey);
                const instance = genAI.getGenerativeModel({ model: modelName });

                console.log(`🤖 AI Request using ${keyObj.label || 'Env'} on ${modelName}`);

                const result = await instance.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Success! Update Usage
                if (!keyObj.isEnv) {
                    await AIKey.findByIdAndUpdate(keyObj._id, {
                        $inc: { usageCount: 1 },
                        status: 'active',
                        lastUsedAt: new Date()
                    });
                }

                return text;

            } catch (error) {
                console.error(`AI Key Failed (${keyObj.label || 'Env'} - ${modelName}):`, error.message);
                lastError = error;

                if (!keyObj.isEnv) {
                    // Logic to handle specific errors logic (simplified for inner loop)
                    if (error.message.includes('429') || error.message.includes('Quota')) {
                        // Don't mark as revoked, just quota exceeded
                    } else if (error.message.includes('401') || error.message.includes('API key not valid')) {
                        // If Auth error, break capability for this key entirely
                        await AIKey.findByIdAndUpdate(keyObj._id, {
                            status: 'revoked',
                            isActive: false,
                            lastError: `Auth Error`,
                        });
                        break; // Stop trying models for this key
                    }
                }
                // Continue to next model
            }
        }
    }

    throw new Error(`AI Generation failed. Last error: ${lastError?.message}`);
};

// Prompts Helpers
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

export const createTaskSuggestionsPrompt = (tasks) => {
    return `You are a task management expert. Analyze these tasks and provide prioritization suggestions:

${tasks.map((t, i) => `${i + 1}. ${t.title} - Priority: ${t.priority}, Due: ${t.dueDate || 'None'}, Status: ${t.status}`).join('\n')}

Provide:
1. Top 3 tasks to focus on today
2. Tasks that can be delegated or postponed
3. Quick wins (tasks that can be completed quickly)

Keep response brief (max 200 words).`;
};

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

export const createTaskBreakdownPrompt = (taskTitle, taskDescription) => {
    return `You are a project manager. Break down this task into smaller, actionable subtasks:
Task: "${taskTitle}"
Description: "${taskDescription || 'No description provided'}"

Provide a JSON array of strings, where each string is a subtask.
Example format:
["Subtask 1", "Subtask 2", "Subtask 3"]

Do not include any markdown formatting or extra text. Just the JSON array.`;
};

export const createFinanceInsightsPrompt = (transactions) => {
    return `You are a financial advisor. Analyze these recent transactions:
${transactions.map(t => `- ${t.date.split('T')[0]}: ${t.description} (${t.amount} ${t.type}) - Category: ${t.category}`).join('\n')}

Provide:
1. Spending trends (e.g., "You spent 20% more on food this month")
2. Saving opportunities
3. A quick financial tip

Keep response concise (max 200 words).`;
};

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



export const createSkillRoadmapPrompt = (skillContext) => {
    return `You are a curriculum expert. Create a learning roadmap for the skill: "${skillContext.skillName}".
Context:
- Current Level: ${skillContext.currentLevel}
- Target Level: ${skillContext.targetLevel}
- Minutes Per Day: ${skillContext.minutesPerDay}
- Category: ${skillContext.category}

Output a JSON array of milestones (phases). Each item should be:
{
  "title": "Phase Title",
  "description": "Short description of this phase",
  "estimatedMinutes": ${skillContext.minutesPerDay},
  "phaseName": "Phase Name (e.g. 'Foundations', 'Advanced Concepts')"
}

Ensure the roadmap covers the gap from Current to Target level.
Output ONLY JSON. No markdown.`;
};

export const createDailyLearningPrompt = (context) => {
    return `You are a tutor. Generate daily learning tasks based on these unfinished roadmap items:
${JSON.stringify(context.skills, null, 2)}

Constraints:
- Max tasks: ${context.maxTasks}
- Total time approx: ${context.minutesAvailable} mins

Output a JSON array of tasks:
[
  {
    "skillName": "Name of skill",
    "title": "Specific actionable learning task",
    "description": "Brief instruction",
    "estimatedMinutes": 30
  }
]
Output ONLY JSON.`;
};

export const createDailyPracticePrompt = (context) => {
    return `You are a coach. Generate practice tasks for these skills:
${JSON.stringify(context.practicingSkills, null, 2)}

Constraints:
- Max tasks: ${context.maxTasks}
- Total time approx: ${context.minutesAvailable} mins
- IMPORTANT: Generate UNIQUE, NON-REPETITIVE, and CREATIVE challenges. 
- Avoid generic tasks. Vary between Debugging, Refactoring, Mini-Projects, and Optimization.

Output a JSON array of tasks:
[
  {
    "skillName": "Name of skill",
    "title": "Specific practice exercise",
    "estimatedMinutes": 15
  }
]
Output ONLY JSON.`;
};

export const createCombinedPlanPrompt = (context) => {
    return `You are a productivity expert. Create a balanced daily plan combining learning and practice.
Learning Items (Priority):
${JSON.stringify(context.roadmapLearningSkills, null, 2)}

Practice Skills (Secondary):
${JSON.stringify(context.practicingSkills, null, 2)}

Constraints:
- Total time: ${context.minutesAvailable} mins
- Max total tasks: 5

Instructions:
1. Generate 'learning' tasks based on the provided Learning Items.
2. Generate 'practice' tasks. These can be:
   - Exercises for the 'Practice Skills' list.
   - Practical application/coding exercises for the 'Learning Items' to reinforce what was learned today.
   - Ensure practice tasks are relevant to the specific topics in that day's learning.

Output a JSON object:
{
  "learning": [ { "skillName": "...", "title": "...", "estimatedMinutes": ... } ],
  "practice": [ { "skillName": "...", "title": "...", "estimatedMinutes": ... } ]
}
Output ONLY JSON.`;
};

export default {
    generateAIResponse,
    createDailyPlanPrompt,
    createTaskSuggestionsPrompt,
    createHabitInsightsPrompt,
    createTaskBreakdownPrompt,
    createFinanceInsightsPrompt,
    createNoteSummaryPrompt,
    createSkillRoadmapPrompt,
    createDailyLearningPrompt,
    createDailyPracticePrompt,
    createCombinedPlanPrompt,
};
