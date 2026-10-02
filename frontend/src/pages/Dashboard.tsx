import React, { useState, useEffect } from 'react';
import { Plus, Loader2, FolderKanban, TrendingUp, PlayCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectFormModal from '../components/projects/ProjectFormModal';
import { projectApi } from '../api/projectApi';
import type { Project } from '../api/projectApi';
import { userApi } from '../api/userApi';

const Dashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [userRole, setUserRole] = useState<string>('USER');

    const canCreate = userRole === 'ADMIN' || userRole === 'MANAGER';

    const loadProjects = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await projectApi.getProjects();
            setProjects(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Не удалось загрузить проекты');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProject = async (id: number) => {
        await projectApi.deleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    useEffect(() => {
        loadProjects();
        userApi.getMe()
            .then(me => setUserRole(me.role))
            .catch(() => setUserRole('USER'));
    }, []);

    const totalProjects = projects.length;
    const avgProgress = totalProjects > 0
        ? Math.round(projects.reduce((sum, p) => sum + (p.progressPercentage ?? 0), 0) / totalProjects)
        : 0;
    const activeProjects = projects.filter(
        p => (p.progressPercentage ?? 0) > 0 && (p.progressPercentage ?? 0) < 100
    ).length;

    const kpiCards = [
        {
            label: 'Всего проектов',
            value: totalProjects,
            suffix: '',
            icon: <FolderKanban className="h-5 w-5" />,
            color: 'text-blue-600',
            bg: 'from-blue-50 to-blue-100/60',
            border: 'border-blue-100',
        },
        {
            label: 'Средний прогресс',
            value: avgProgress,
            suffix: '%',
            icon: <TrendingUp className="h-5 w-5" />,
            color: 'text-emerald-600',
            bg: 'from-emerald-50 to-emerald-100/60',
            border: 'border-emerald-100',
        },
        {
            label: 'Проектов в работе',
            value: activeProjects,
            suffix: '',
            icon: <PlayCircle className="h-5 w-5" />,
            color: 'text-violet-600',
            bg: 'from-violet-50 to-violet-100/60',
            border: 'border-violet-100',
        },
    ];

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Мои проекты</h1>
                    {canCreate && (
                        <button
                            onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
                            className="flex items-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Создать проект
                        </button>
                    )}
                </div>

                {}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {kpiCards.map((card) => (
                            <div
                                key={card.label}
                                className={`bg-gradient-to-br ${card.bg} border ${card.border} rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm`}
                            >
                                <div className={`shrink-0 w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center ${card.color} shadow-sm`}>
                                    {card.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-none mb-1">{card.label}</p>
                                    <p className={`text-2xl font-bold ${card.color} leading-none`}>
                                        {card.value}{card.suffix}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-emerald-600 h-10 w-10 opacity-80" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50/50 text-red-600 p-6 rounded-2xl text-center border border-red-100 max-w-2xl mx-auto">
                        <p className="font-medium text-lg mb-2">Ошибка</p>
                        <p className="text-sm opacity-90">{error}</p>
                        <button
                            onClick={loadProjects}
                            className="mt-4 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-xl transition-colors"
                        >
                            Повторить попытку
                        </button>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto mt-10">
                        <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">У вас пока нет проектов</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            {canCreate
                                ? 'Начните работу, создав свой первый проект в системе.'
                                : 'Проекты появятся здесь, когда менеджер назначит вас участником.'}
                        </p>
                        {canCreate && (
                            <button
                                onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
                                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Создать первый проект
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.isArray(projects) && projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    canManage={canCreate}
                                    onDelete={handleDeleteProject}
                                    onEdit={handleEditProject}
                                />
                        ))}
                    </div>
                )}
            </div>

            <ProjectFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
                onProjectSaved={loadProjects}
                projectToEdit={editingProject || undefined}
            />
        </DashboardLayout>
    );
};

export default Dashboard;
