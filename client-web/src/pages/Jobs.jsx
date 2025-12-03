import React, { useEffect, useState } from 'react';
import { Plus, Briefcase, ExternalLink, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useJobStore from '../store/jobStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';
import { format } from 'date-fns';

const Jobs = () => {
    const { jobs, fetchJobs, addJob, updateJob, deleteJob, parseJobLink, isLoading } = useJobStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [parsingUrl, setParsingUrl] = useState(false);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const onSubmit = async (data) => {
        const success = await addJob({
            ...data,
            status: 'applied', // Default status
            dateApplied: new Date().toISOString()
        });
        if (success) {
            setIsModalOpen(false);
            reset();
        }
    };

    const handleParse = async (e) => {
        const url = e.target.value;
        if (!url) return;

        setParsingUrl(true);
        const data = await parseJobLink(url);
        setParsingUrl(false);

        if (data) {
            setValue('company', data.company);
            setValue('position', data.position);
            setValue('location', data.location);
            setValue('description', data.description);
        }
    };

    const columns = [
        { id: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
        { id: 'interview', label: 'Interview', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
        { id: 'offer', label: 'Offer', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
        { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    ];

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Applications</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your career opportunities</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Application
                </Button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-6 h-full min-w-[1000px]">
                    {columns.map((column) => (
                        <div key={column.id} className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{column.label}</h3>
                                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", column.color)}>
                                    {jobs.filter(j => j.status === column.id).length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                {jobs.filter(j => j.status === column.id).map((job) => (
                                    <div key={job._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 group">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-gray-900 dark:text-white">{job.position}</h4>
                                            <button
                                                onClick={() => deleteJob(job._id)}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{job.company}</p>

                                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                                            <span>{format(new Date(job.dateApplied), 'MMM d')}</span>
                                            {job.salary && <span>{job.salary}</span>}
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                                            <select
                                                value={job.status}
                                                onChange={(e) => updateJob(job._id, { status: e.target.value })}
                                                className="text-xs bg-transparent border-none p-0 text-blue-600 focus:ring-0 cursor-pointer"
                                            >
                                                {columns.map(c => (
                                                    <option key={c.id} value={c.id}>{c.label}</option>
                                                ))}
                                            </select>
                                            {job.link && (
                                                <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Job Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Job Application"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Job Link (Optional - AI Auto-fill)"
                        placeholder="Paste job URL to auto-fill..."
                        onBlur={handleParse}
                        {...register('link')}
                    />
                    {parsingUrl && <p className="text-xs text-blue-500">Analyzing job link...</p>}

                    <Input
                        label="Company"
                        placeholder="Company Name"
                        {...register('company', { required: 'Company is required' })}
                        error={errors.company?.message}
                    />

                    <Input
                        label="Position"
                        placeholder="Job Title"
                        {...register('position', { required: 'Position is required' })}
                        error={errors.position?.message}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Location"
                            placeholder="e.g., Remote, NY"
                            {...register('location')}
                        />
                        <Input
                            label="Salary"
                            placeholder="e.g., $120k"
                            {...register('salary')}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Add Application
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Jobs;
