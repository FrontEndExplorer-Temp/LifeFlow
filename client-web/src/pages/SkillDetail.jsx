import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, Circle, Target, Zap, Clock } from 'lucide-react';
import useSkillStore from '../store/skillStore';
import useTaskStore from '../store/taskStore';
import TaskCard from '../components/tasks/TaskCard';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

const SkillDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { skills, fetchSkills, generateRoadmap, generateDailyPractice, toggleRoadmapItem, isLoading } = useSkillStore();
    const { tasks, fetchTasks } = useTaskStore();
    const [generating, setGenerating] = useState(false);

    // Ensure skills and tasks are loaded
    useEffect(() => {
        if (skills.length === 0) fetchSkills();
        if (tasks.length === 0) fetchTasks();
    }, [fetchSkills, fetchTasks, skills.length, tasks.length]);

    const skill = skills.find(s => s._id === id);

    if (isLoading && !skill) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (!skill) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Skill not found</h3>
                <Button variant="ghost" className="mt-4" onClick={() => navigate('/skills')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Skills
                </Button>
            </div>
        );
    }

    const handleGenerateRoadmap = async () => {
        setGenerating(true);
        try {
            await generateRoadmap(id);
            toast.success('Roadmap generated successfully!');
        } catch (error) {
            toast.error('Failed to generate roadmap');
        } finally {
            setGenerating(false);
        }
    };

    const handleGeneratePractice = async () => {
        setGenerating(true);
        try {
            await generateDailyPractice({ maxTasks: 3, minutesAvailable: 30 });
            toast.success('Practice tasks added to your Task List!');
            navigate('/tasks'); // Redirect to tasks to see the result
        } catch (error) {
            toast.error('Failed to generate practice tasks');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <Button variant="ghost" onClick={() => navigate('/skills')} className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Skills
                </Button>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{skill.name}</h1>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                                    skill.status === 'learning'
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                )}>
                                    {skill.status === 'learning' ? 'Learning Mode' : 'Practice Mode'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-gray-900 dark:text-white">{skill.currentLevel}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{skill.targetLevel}</span>
                                </div>
                                <span>•</span>
                                <span>{skill.category}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{skill.minutesPerDay}m / day</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div>
                            {skill.status === 'learning' ? (
                                (!skill.roadmap || skill.roadmap.length === 0) && (
                                    <Button onClick={handleGenerateRoadmap} isLoading={generating}>
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Generate AI Roadmap
                                    </Button>
                                )
                            ) : (
                                <Button onClick={handleGeneratePractice} isLoading={generating} className="bg-green-600 hover:bg-green-700 text-white">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Generate Practice Tasks
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            {skill.status === 'learning' ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        Learning Roadmap
                    </h2>

                    {skill.roadmap && skill.roadmap.length > 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {skill.roadmap.map((item, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "p-4 border-b last:border-0 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex gap-4 cursor-pointer group",
                                        item.isCompleted && "bg-gray-50/50 dark:bg-gray-800/50"
                                    )}
                                    onClick={() => toggleRoadmapItem(skill._id, index)}
                                >
                                    <div className="mt-1">
                                        {item.isCompleted ? (
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{item.phaseName}</span>
                                            <span className="text-xs text-gray-400">{item.estimatedMinutes}m</span>
                                        </div>
                                        <h3 className={cn(
                                            "font-medium text-gray-900 dark:text-white mb-1 transition-all",
                                            item.isCompleted && "line-through text-gray-400 dark:text-gray-500"
                                        )}>
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">No roadmap generated yet.</p>
                            <p className="text-sm text-gray-400 mt-1">Click the button above to generate one!</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Practice Mode Info */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 p-6 rounded-xl border border-green-100 dark:border-green-800/30 h-[261px] flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-800/40 rounded-full flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">Ready to Practice?</h3>
                                <p className="text-green-700 dark:text-green-300/80 mb-6">
                                    Since you already know the basics, TimeFlow will generate 3 random daily challenges tailored to your <strong>{skill.currentLevel}</strong> level.
                                </p>
                            </div>
                            <Button onClick={handleGeneratePractice} isLoading={generating} className="w-full bg-green-600 hover:bg-green-700 text-white border-none">
                                Generate Today's Challenges
                            </Button>
                        </div>

                        {/* Skill Stats */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-[261px]">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Skill Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {tasks.filter(t => t.skillName && skill.name && t.skillName.toLowerCase() === skill.name.toLowerCase() && t.status === 'Completed').length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{skill.currentStreak || 0} days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Practice Tasks */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white">Recent Challenges</h3>
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                Last 5
                            </span>
                        </div>

                        <div className="space-y-3">
                            {tasks.filter(t => t.skillName && skill.name && t.skillName.toLowerCase() === skill.name.toLowerCase()).length > 0 ? (
                                tasks
                                    .filter(t => t.skillName && skill.name && t.skillName.toLowerCase() === skill.name.toLowerCase())
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .slice(0, 5)
                                    .map(task => (
                                        <TaskCard key={task._id} task={task} />
                                    ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Zap className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">No active challenges</p>
                                    <p className="text-xs text-gray-500 mt-1">Generate your first challenge above!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillDetail;
