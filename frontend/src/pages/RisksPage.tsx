import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { riskApi, type Risk } from '../api/riskApi';
import { projectApi, type Project } from '../api/projectApi';
import { userApi } from '../api/userApi';
import { AlertCircle, Plus, Edit2, Trash2, Loader2, X, ChevronDown } from 'lucide-react';

const LEVEL_COLORS: Record<string, string> = {
    'Высокий': 'bg-red-100 text-red-700',
    'Средний': 'bg-yellow-100 text-yellow-700',
    'Низкий': 'bg-emerald-100 text-emerald-700',
};

const STATUS_COLORS: Record<string, string> = {
    'Активен': 'bg-blue-100 text-blue-700',
    'Решен': 'bg-gray-100 text-gray-600',
};

export interface RisksPageProps {
    projectId?: number;
}

const RisksPage: React.FC<RisksPageProps> = ({ projectId: propProjectId }) => {
    const [risks, setRisks] = useState<Risk[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isRisksLoading, setIsRisksLoading] = useState(true);
    const [isProjectsLoading, setIsProjectsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Risk | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [level, setLevel] = useState('Низкий');
    const [status, setStatus] = useState('Активен');
    const [projectId, setProjectId] = useState<number | ''>('');
    const [saving, setSaving] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<'project' | 'level' | 'status' | null>(null);

    const [userRole, setUserRole] = useState<string>('USER');
    const canManage = userRole === 'ADMIN' || userRole === 'MANAGER';

    useEffect(() => {
        userApi.getMe()
            .then(me => setUserRole(me.role))
            .catch(() => setUserRole('USER'));
        if (!propProjectId) {
            projectApi.getProjects()
                .then(data => setProjects(Array.isArray(data) ? data : []))
                .catch(err => console.error('Failed to load projects', err))
                .finally(() => setIsProjectsLoading(false));
        } else {
            setIsProjectsLoading(false);
        }

        riskApi.getAllRisks(0, 50)
            .then(data => {
                const fetchedRisks = data?.content ?? [];
                setRisks(propProjectId ? fetchedRisks.filter(r => r.projectId === propProjectId) : fetchedRisks);
            })
            .catch(err => console.error('Failed to load risks', err))
            .finally(() => setIsRisksLoading(false));
    }, [propProjectId]);

    const projectMap = projects.reduce((acc, p) => {
        acc[p.id] = p.name;
        return acc;
    }, {} as Record<number, string>);

    const reloadRisks = () => {
        setIsRisksLoading(true);
        riskApi.getAllRisks(0, 50)
            .then(data => {
                const fetchedRisks = data?.content ?? [];
                setRisks(propProjectId ? fetchedRisks.filter(r => r.projectId === propProjectId) : fetchedRisks);
            })
            .catch(err => console.error('Failed to reload risks', err))
            .finally(() => setIsRisksLoading(false));
    };

    const handleOpenModal = (risk?: Risk) => {
        if (risk) {
            setEditingRisk(risk);
            setTitle(risk.title);
            setDescription(risk.description || '');
            setLevel(risk.level);
            setStatus(risk.status);
            setProjectId(risk.projectId);
        } else {
            setEditingRisk(null);
            setTitle('');
            setDescription('');
            setLevel('Низкий');
            setStatus('Активен');

            setProjectId(propProjectId || (projects.length > 0 ? projects[0].id : ''));
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRisk(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (projectId === '') {
            alert('Пожалуйста, выберите проект.');
            return;
        }
        setSaving(true);
        try {
            const data = { title, description, level, status, projectId: Number(projectId) };
            if (editingRisk) {
                await riskApi.updateRisk(editingRisk.id, data);
            } else {
                await riskApi.createRisk(data);
            }
            reloadRisks();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save risk', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот риск?')) return;
        try {
            await riskApi.deleteRisk(id);
            setRisks(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to delete risk', error);
        }
    };

    const noProjects = !propProjectId && !isProjectsLoading && projects.length === 0;
    const loading = isRisksLoading;

    const content = (
        <>
            <div className="p-8 md:p-10 min-h-full bg-gray-50/50">
            <div className="max-w-6xl mx-auto">
                {}
                <div className={`flex flex-col sm:flex-row ${propProjectId ? 'justify-end' : 'justify-between'} items-start sm:items-center gap-4 mb-8`}>
                    {!propProjectId && (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                            </span>
                            Управление рисками
                        </h1>
                        <p className="text-gray-400 text-sm mt-1 ml-12">Все проектные риски на одном экране</p>
                    </div>
                    )}
                    {canManage && (
                        <button
                            onClick={() => handleOpenModal()}
                            disabled={(!propProjectId && isProjectsLoading) || noProjects}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Добавить риск
                        </button>
                    )}
                </div>

                    {}
                    {noProjects && (
                        <div className="mb-6 p-4 rounded-xl bg-blue-50 text-blue-700 text-sm border border-blue-100 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                            <p>Для добавления рисков необходимо сначала создать хотя бы один проект.</p>
                        </div>
                    )}

                    {}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        ) : risks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">Нет рисков</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                    Риски пока не добавлены.
                                </p>
                                {!noProjects && canManage && (
                                    <button
                                        onClick={() => handleOpenModal()}
                                        className="mt-4 text-emerald-600 font-medium hover:text-emerald-700"
                                    >
                                        Добавить риск
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {!propProjectId && <th className="px-6 py-3">Проект</th>}
                                            <th className="px-6 py-3">Название</th>
                                            <th className="px-6 py-3">Описание</th>
                                            <th className="px-6 py-3">Уровень</th>
                                            <th className="px-6 py-3">Статус</th>
                                            <th className="px-6 py-3 text-right">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {risks.map(risk => (
                                            <tr key={risk.id} className="hover:bg-gray-50/70 transition-colors">
                                                {!propProjectId && (
                                                <td className="px-6 py-4 text-gray-600 font-medium truncate max-w-[150px]">
                                                    {projectMap[risk.projectId] || `Проект ${risk.projectId}`}
                                                </td>
                                                )}
                                                <td className="px-6 py-4 font-medium text-gray-800">{risk.title}</td>
                                                <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={risk.description}>
                                                    {risk.description || '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${LEVEL_COLORS[risk.level] || 'bg-gray-100 text-gray-600'}`}>
                                                        {risk.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[risk.status] || 'bg-gray-100 text-gray-600'}`}>
                                                        {risk.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    {canManage && (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenModal(risk)}
                                                                className="text-gray-400 hover:text-blue-500 transition-colors mr-3"
                                                                title="Редактировать"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(risk.id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                                title="Удалить"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">
                                {editingRisk ? 'Редактировать риск' : 'Новый риск'}
                            </h2>
                            <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {}
                            {!propProjectId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Проект <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        disabled={!!editingRisk}
                                        onClick={() => setOpenDropdown(openDropdown === 'project' ? null : 'project')}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className={projectId === '' ? 'text-gray-400' : 'text-gray-900'}>
                                            {projectId !== '' ? (projects.find(p => p.id === projectId)?.name ?? 'Проект') : 'Выберите проект'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'project' ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openDropdown === 'project' && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                            {projects.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => { setProjectId(p.id); setOpenDropdown(null); }}
                                                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                                                        projectId === p.id
                                                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                                                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                                                    }`}
                                                >
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Название риска <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                    placeholder="Например: Задержка поставок"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                                    placeholder="Детали риска..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Уровень</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setOpenDropdown(openDropdown === 'level' ? null : 'level')}
                                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                        >
                                            <span className={`font-medium ${level === 'Высокий' ? 'text-red-600' : level === 'Средний' ? 'text-yellow-600' : 'text-emerald-600'}`}>
                                                {level}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'level' ? 'rotate-180' : ''}`} />
                                        </button>
                                        {openDropdown === 'level' && (
                                            <div className="absolute z-20 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                {['Низкий', 'Средний', 'Высокий'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => { setLevel(opt); setOpenDropdown(null); }}
                                                        className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                                                            level === opt
                                                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                                                : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                        >
                                            <span className={`font-medium ${status === 'Активен' ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {status}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
                                        </button>
                                        {openDropdown === 'status' && (
                                            <div className="absolute z-20 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                {['Активен', 'Решен'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => { setStatus(opt); setOpenDropdown(null); }}
                                                        className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                                                            status === opt
                                                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                                                : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || projectId === ''}
                                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );

    return propProjectId ? content : <DashboardLayout>{content}</DashboardLayout>;
};

export default RisksPage;
