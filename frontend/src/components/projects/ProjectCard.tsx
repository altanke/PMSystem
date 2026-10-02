import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Loader2, Globe, Lock, Pencil } from 'lucide-react';
import type { Project } from '../../api/projectApi';
import { getProjectStatus } from '../../utils/projectStatus';

interface ProjectCardProps {
    project: Project;
    canManage: boolean;
    onDelete: (id: number) => Promise<void>;
    onEdit?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, canManage, onDelete, onEdit }) => {
    const navigate = useNavigate();
    const progress = project.progressPercentage ?? 0;
    const status = getProjectStatus(progress);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleCardClick = () => {
        navigate(`/projects/${project.id}`);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleting(true);
        try {
            await onDelete?.(project.id);
        } finally {
            setDeleting(false);
            setConfirmOpen(false);
        }
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmOpen(false);
    };

    return (
        <>
            <div
                onClick={handleCardClick}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-500 hover:cursor-pointer transition-all flex flex-col h-full relative"
            >
                {}
                <span
                    className={`absolute top-4 right-4 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.badgeClass}`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                    {status.label}
                </span>

                <div className="flex-1">
                    {}
                    <h3 className="text-lg font-semibold text-gray-800 mb-1.5 line-clamp-1 pr-28">{project.name}</h3>
                    {}
                    <span className={`inline-flex items-center gap-1 text-xs font-medium mb-3 px-2 py-0.5 rounded-full ${project.publicAccess ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {project.publicAccess ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {project.publicAccess ? 'Публичный' : 'Приватный'}
                    </span>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                        {project.description || 'Нет описания'}
                    </p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-end justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="font-medium text-gray-700">Прогресс</span>
                            <span className="text-emerald-600 font-semibold">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    {}
                    {canManage && (
                        <div className="flex items-center gap-2 shrink-0">
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(project);
                                    }}
                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                    title="Редактировать проект"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={handleDeleteClick}
                                disabled={deleting}
                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                title="Удалить проект"
                            >
                                {deleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {}
            {confirmOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={handleCancelDelete}
                >
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
                    <div
                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-rose-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Удалить проект?</h2>
                        </div>
                        <p className="text-sm text-gray-500">
                            Вы уверены, что хотите удалить проект <span className="font-semibold text-gray-700">«{project.name}»</span>?
                            Это действие необратимо — все задачи, риски и ресурсы проекта будут удалены.
                        </p>
                        <div className="flex justify-end gap-3 pt-1">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl transition-colors flex items-center gap-2"
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectCard;
