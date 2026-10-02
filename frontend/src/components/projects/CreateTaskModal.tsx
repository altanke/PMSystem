import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { projectApi, type Task } from '../../api/projectApi';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
    onTaskCreated: () => void;
    existingTasks: Task[];
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
    isOpen,
    onClose,
    projectId,
    onTaskCreated,
    existingTasks
}) => {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState<number>(1);
    const [selectedPredecessors, setSelectedPredecessors] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const togglePredecessor = (taskId: number) => {
        setSelectedPredecessors(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await projectApi.createTask({
                projectId,
                name,
                description: '',
                durationEstimateHours: duration,
                predecessors: selectedPredecessors.map(id => ({ taskId: id, dependencyType: 'FS', lagTimeHours: 0 })),
                status: 'TODO',
                priority: 'MEDIUM',
            } as any);

            setName('');
            setDuration(1);
            setSelectedPredecessors([]);
            onTaskCreated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка создания задачи');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">Создать задачу</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50/50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="task-name" className="block text-sm font-medium text-gray-700 pl-1 mb-1">
                            Название
                        </label>
                        <input
                            id="task-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full py-2.5 px-4 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all"
                            placeholder="Спроектировать базу данных"
                        />
                    </div>

                    <div>
                        <label htmlFor="task-duration" className="block text-sm font-medium text-gray-700 pl-1 mb-1">
                            Длительность (рабочие часы)
                        </label>
                        <input
                            id="task-duration"
                            type="number"
                            min="1"
                            required
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="block w-full py-2.5 px-4 bg-gray-50 border-0 rounded-2xl text-gray-900 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all"
                        />
                        <p className="text-[11px] text-gray-400 pl-1 mt-1">Считается в рабочих часах (09:00–18:00, без выходных)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 pl-1 mb-2">
                            Предшественники
                        </label>
                        {existingTasks.length === 0 ? (
                            <p className="text-xs text-gray-400 pl-1">Нет задач для выбора — создайте их сначала.</p>
                        ) : (
                            <div className="max-h-44 overflow-y-auto rounded-2xl bg-gray-50 p-2 space-y-1">
                                {existingTasks.map((task, idx) => {
                                    const checked = selectedPredecessors.includes(task.id);
                                    return (
                                        <label
                                            key={task.id}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                                                checked
                                                    ? 'bg-emerald-50 text-emerald-800'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded accent-emerald-600 cursor-pointer shrink-0"
                                                checked={checked}
                                                onChange={() => togglePredecessor(task.id)}
                                            />
                                            <span className="text-sm font-medium truncate">
                                                <span className="text-gray-400 mr-1.5">{idx + 1}.</span>
                                                {task.name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        {selectedPredecessors.length > 0 && (
                            <p className="text-xs text-emerald-600 pl-1 mt-1.5">
                                Выбрано: {selectedPredecessors
                                    .map(id => existingTasks.find(t => t.id === id)?.name)
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                        )}
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
                            className={`px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center ${
                                isLoading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'
                            }`}
                        >
                            {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
