import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Target, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useSkillStore from '../store/skillStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';

import { useNavigate } from 'react-router-dom';
// ... imports

const SkillCard = ({ skill }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/skills/${skill._id}`)}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{skill.name}</h3>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                        {skill.category}
                    </span>
                </div>
                <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold uppercase",
                    skill.status === 'learning'
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                )}>
                    {skill.status === 'learning' ? 'Learning' : 'Practicing'}
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{skill.currentLevel}</span>
                <ArrowRight className="w-4 h-4" />
                <span className="font-medium text-gray-900 dark:text-white">{skill.targetLevel}</span>
            </div>

            {skill.status === 'learning' ? (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Roadmap Progress</span>
                        <span>{skill.roadmap?.filter(i => i.isCompleted).length || 0} / {skill.roadmap?.length || 0}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${skill.roadmap?.length ? (skill.roadmap.filter(i => i.isCompleted).length / skill.roadmap.length) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
                    <Zap className="w-4 h-4" />
                    <span>Daily Practice Enabled</span>
                </div>
            )}
        </div>
    );
};

const Skills = () => {
    const { skills, fetchSkills, createSkill, isLoading } = useSkillStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            status: 'learning',
            minutesPerDay: 30,
            currentLevel: 'Beginner',
            targetLevel: 'Advanced'
        }
    });

    const status = watch('status');

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    const onSubmit = async (data) => {
        await createSkill(data);
        setIsModalOpen(false);
        reset();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skills & Learning</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track your growth and master new abilities</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Skill
                </Button>
            </div>

            {/* Empty State */}
            {!isLoading && skills.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No skills added yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">Start your journey by adding a skill you want to learn or practice.</p>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map(skill => (
                    <SkillCard key={skill._id} skill={skill} />
                ))}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Skill"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Skill Name"
                        placeholder="e.g. React, Python, Guitar"
                        {...register('name', { required: 'Skill name is required' })}
                    />

                    <Input
                        label="Category"
                        placeholder="e.g. Development, Music, Language"
                        {...register('category')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Current Level"
                            placeholder="Beginner"
                            {...register('currentLevel')}
                        />
                        <Input
                            label="Target Level"
                            placeholder="Expert"
                            {...register('targetLevel')}
                        />
                    </div>

                    <Input
                        label="Minutes Per Day"
                        type="number"
                        {...register('minutesPerDay')}
                    />

                    {/* Goal Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setValue('status', 'learning')}
                                className={cn(
                                    "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                    status === 'learning'
                                        ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-300"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                                )}
                            >
                                <BookOpen className="w-6 h-6" />
                                <span className="font-semibold text-sm">Learn New</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setValue('status', 'practicing')}
                                className={cn(
                                    "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                    status === 'practicing'
                                        ? "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-500 dark:text-green-300"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                                )}
                            >
                                <Target className="w-6 h-6" />
                                <span className="font-semibold text-sm">Practice Existing</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Create Skill
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Skills;
