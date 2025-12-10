import Skill from '../models/skillModel.js';

export const updateSkillActivity = async (userId, skillId) => {
    try {
        const skill = await Skill.findOne({ _id: skillId, user: userId });
        if (!skill) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActivity = skill.lastActivityDate ? new Date(skill.lastActivityDate) : null;
        if (lastActivity) lastActivity.setHours(0, 0, 0, 0);

        // If already active today, do nothing
        if (lastActivity && lastActivity.getTime() === today.getTime()) {
            return skill;
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let newStreak = 1;

        if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
            // Continued streak
            newStreak = (skill.currentStreak || 0) + 1;
        } else {
            // Broken streak or first time
            newStreak = 1;
        }

        skill.currentStreak = newStreak;
        skill.lastActivityDate = new Date(); // Stores precise time

        if (newStreak > (skill.bestStreak || 0)) {
            skill.bestStreak = newStreak;
        }

        await skill.save();
        return skill;

    } catch (error) {
        console.error("Error updating skill activity:", error);
        throw error;
    }
};

export default {
    updateSkillActivity
};
