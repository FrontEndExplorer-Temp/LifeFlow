import React, { useEffect } from 'react';
import { Sparkles, Clock, Zap, Target } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useSummaryStore from '../store/summaryStore';
import useTaskStore from '../store/taskStore';
import useTimerStore from '../store/timerStore';
import useSkillStore from '../store/skillStore';
import { cn } from '../utils/cn';
import FocusTimerCard from '../components/dashboard/FocusTimerCard';
import TaskActionCard from '../components/dashboard/TaskActionCard';
import { useNavigate } from 'react-router-dom';

const SummaryItem = ({ value, label, color, subColor }) => (
    <div className={cn("flex flex-col items-center p-4 rounded-2xl w-full", subColor)}>
        <span className={cn("text-2xl font-bold mb-1", color)}>{value}</span>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
);

const Focus = () => {
    const { user } = useAuthStore();
    const { todaySummary, fetchTodaySummary } = useSummaryStore();
    const { tasks, fetchTasks } = useTaskStore();
    const { activeTimer, syncActiveTimer } = useTimerStore();
    const { generateDailyPlan, isLoading: skillLoading } = useSkillStore();
    const navigate = useNavigate();

    useEffect(() => {
        syncActiveTimer();
        fetchTodaySummary();
        fetchTasks();

        // Polling interaction for stats refresh
        const interval = setInterval(() => {
            if (!document.hidden) {
                fetchTodaySummary();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleGeneratePlan = async () => {
        const hasExistingPlan = tasks.some(t => t.status === 'Today' && (t.taskType === 'learning' || t.taskType === 'practice'));

        if (hasExistingPlan) {
            const replace = window.confirm("You already have a plan for today. Click OK to REPLACE it with a new one.");
            if (replace) {
                await generateDailyPlan({ minutesAvailable: 90, mode: 'replace' });
            } else {
                await generateDailyPlan({ minutesAvailable: 90, mode: 'append' });
            }
        } else {
            await generateDailyPlan({ minutesAvailable: 90, mode: 'append' });
        }
        await fetchTasks();
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const learningTasks = tasks.filter(t => t.taskType === 'learning' && t.status === 'Today');
    const practiceTasks = tasks.filter(t => t.taskType === 'practice' && t.status === 'Today');

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            {/* Header */}
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Focus Session</h1>
                    <p className="text-sm text-gray-500">Manage your daily goals and deep work.</p>
                </div>
            </div>

            {/* Hero Timer Card */}
            <FocusTimerCard />

            {/* Plan Generator Action */}
            <button
                onClick={handleGeneratePlan}
                disabled={skillLoading}
                className="w-full py-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
                {skillLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        Generate Plan
                    </>
                )}
            </button>

            {/* Learning Tasks Section */}
            {learningTasks.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                            Learning
                        </h3>
                    </div>
                    <div className="grid gap-3">
                        {learningTasks.map(task => (
                            <TaskActionCard
                                key={task._id}
                                task={task}
                                icon={Clock}
                                color="text-gray-700 dark:text-gray-300"
                                subColor="bg-gray-50 dark:bg-gray-800"
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Practice Tasks Section */}
            {practiceTasks.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Zap className="w-4 h-4 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                            Practice
                        </h3>
                    </div>
                    <div className="grid gap-3">
                        {practiceTasks.map(task => (
                            <TaskActionCard
                                key={task._id}
                                task={task}
                                icon={Zap}
                                color="text-gray-700 dark:text-gray-300"
                                subColor="bg-gray-50 dark:bg-gray-800"
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Focus;
