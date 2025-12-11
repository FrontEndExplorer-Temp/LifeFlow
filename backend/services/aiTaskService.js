import Task from '../models/taskModel.js';
import Skill from '../models/skillModel.js';

/**
 * Parses Roadmap JSON from AI
 * Expected format: [ { title, description, estimatedMinutes, phaseName } ]
 */
export const parseRoadmapJson = (jsonString) => {
    try {
        // Find JSON array in text if mixed with text
        const match = jsonString.match(/\[.*\]/s);
        const cleanJson = match ? match[0] : jsonString;

        const tasks = JSON.parse(cleanJson);

        if (!Array.isArray(tasks)) {
            throw new Error('AI output is not an array');
        }

        return tasks.map((t, index) => ({
            title: t.title,
            description: t.description,
            estimatedMinutes: t.estimatedMinutes,
            phaseName: t.phaseName || 'General',
            order: index + 1
        }));

    } catch (error) {
        console.error("Error parsing roadmap JSON:", error);
        throw new Error("Failed to parse AI Roadmap");
    }
};

/**
 * Parses Tasks JSON from AI
 * Expected format: [ { title, description, estimatedMinutes, skillName? } ]
 */
export const parseTasksJson = (jsonString) => {
    try {
        const match = jsonString.match(/\[.*\]/s);
        const cleanJson = match ? match[0] : jsonString;

        const tasks = JSON.parse(cleanJson);

        if (!Array.isArray(tasks)) {
            throw new Error('AI output is not an array');
        }

        return tasks.map(t => ({
            title: t.title,
            description: t.description || '',
            estimatedMinutes: t.estimatedMinutes || 30,
            skillName: t.skillName // vital for combined plan
        }));

    } catch (error) {
        console.error("Error parsing tasks JSON:", error);
        throw new Error("Failed to parse AI Tasks");
    }
};

/**
 * Creates actual Task documents from generic task objects
 */
export const createTasksFromAi = async ({ userId, tasks, taskType, skillId }) => {
    const createdTasks = [];

    for (const t of tasks) {
        const newTask = new Task({
            user: userId,
            title: t.title,
            description: t.description,
            status: 'Today', // Default for AI generated daily tasks
            priority: 'Medium',
            estimatedMinutes: t.estimatedMinutes || 30,
            taskType: taskType, // 'learning' or 'practice'
            skillId: skillId || t.skillId, // Pass explicit ID or let logic handle it if mapping needed
            skillName: t.skillName // Essential for frontend filtering
        });

        await newTask.save();
        createdTasks.push(newTask);
    }

    return createdTasks;
};

export default {
    parseRoadmapJson,
    parseTasksJson,
    createTasksFromAi
};
