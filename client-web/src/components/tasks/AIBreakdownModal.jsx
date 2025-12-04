import React, { useState } from 'react';
import { Sparkles, Loader2, Check, RefreshCw } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import useTaskStore from '../../store/taskStore';

const AIBreakdownModal = ({ isOpen, onClose, taskTitle, taskDescription, onAddSubtasks }) => {
    const { generateSubtasks } = useTaskStore();
    const [isLoading, setIsLoading] = useState(false);
    const [subtasks, setSubtasks] = useState([]);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = async () => {
        if (!taskTitle) return;
        setIsLoading(true);
        const result = await generateSubtasks(taskTitle, taskDescription);
        setSubtasks(result || []);
        setGenerated(true);
        setIsLoading(false);
    };

    const handleAdd = () => {
        onAddSubtasks(subtasks);
        handleClose();
    };

    const handleClose = () => {
        onClose();
        // Reset state after a short delay to allow animation to finish
        setTimeout(() => {
            setSubtasks([]);
            setGenerated(false);
        }, 300);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={
                <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span>AI Task Breakdown</span>
                </div>
            }
        >
            <div className="space-y-6">
                {!generated ? (
                    <div className="text-center py-8">
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Generate Subtasks
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            Let AI analyze "{taskTitle || 'your task'}" and break it down into actionable steps for you.
                        </p>
                        <Button
                            onClick={handleGenerate}
                            isLoading={isLoading}
                            disabled={!taskTitle}
                            className="w-full sm:w-auto"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Breakdown
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 dark:text-white">Suggested Subtasks:</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                {subtasks.length} steps
                            </span>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 max-h-60 overflow-y-auto border border-gray-100 dark:border-gray-700">
                            {subtasks.length > 0 ? (
                                <ul className="space-y-3">
                                    {subtasks.map((task, index) => (
                                        <li key={index} className="flex items-start space-x-3 text-sm">
                                            <span className="flex-shrink-0 w-5 h-5 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs text-gray-500 font-medium mt-0.5">
                                                {index + 1}
                                            </span>
                                            <span className="text-gray-700 dark:text-gray-300">{task}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 text-sm py-4">No subtasks generated.</p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setGenerated(false)}
                                className="flex-1"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                            <Button
                                onClick={handleAdd}
                                className="flex-1"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Add All Steps
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AIBreakdownModal;
