import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { projectApi } from '../../api/projectApi';
import type { Task } from '../../api/projectApi';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onTaskUpdated: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, onTaskUpdated }) => {
    const [name, setName] = useState(task.name);
    const [duration, setDuration] = useState<number>(task.durationEstimateHours);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setName(task.name);
        setDuration(task.durationEstimateHours);
    }, [task]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await projectApi.updateTask(task.id, {
                name: name,
                durationEstimateHours: duration,
                description: task.description,
                status: 'TODO',
                priority: 'MEDIUM',
            } as any);

            onTaskUpdated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка обновления задачи');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">Редактировать задачу #{task.id}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50/50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 pl-1 mb-1">
                                Название
                            </label>
                            <input
                                id="edit-name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full py-2.5 px-4 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700 pl-1 mb-1">
                                Длительность (в часах)
                            </label>
                            <input
                                id="edit-duration"
                                type="number"
                                min="1"
                                required
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="block w-full py-2.5 px-4 bg-gray-50 border-0 rounded-2xl text-gray-900 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center ${isLoading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'}`}
                        >
                            {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTaskModal;
