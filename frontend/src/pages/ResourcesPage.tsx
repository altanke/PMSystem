import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { resourceApi, type Resource } from '../api/resourceApi';
import { projectApi, type Project } from '../api/projectApi';
import { userApi } from '../api/userApi';
import { Package, Plus, Trash2, Loader2, X, ChevronDown } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
    HUMAN:     'Человек',
    MATERIAL:  'Материал',
    EQUIPMENT: 'Оборудование',
    SOFTWARE:  'ПО',
};

const TYPE_COLORS: Record<string, string> = {
    HUMAN:     'bg-blue-100 text-blue-700',
    MATERIAL:  'bg-amber-100 text-amber-700',
    EQUIPMENT: 'bg-purple-100 text-purple-700',
    SOFTWARE:  'bg-emerald-100 text-emerald-700',
};

const TYPES = ['HUMAN', 'MATERIAL', 'EQUIPMENT', 'SOFTWARE'];

export interface ResourcesPageProps {
    projectId?: number;
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({ projectId: propProjectId }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProjectsLoading, setIsProjectsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [name, setName] = useState('');
    const [type, setType] = useState<string>('HUMAN');
    const [costPerUnit, setCostPerUnit] = useState<string>('');
    const [projectId, setProjectId] = useState<number | ''>('');
    const [saving, setSaving] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<'project' | 'type' | null>(null);

    const [userRole, setUserRole] = useState<string>('USER');
    const canManage = userRole === 'ADMIN' || userRole === 'MANAGER';

    useEffect(() => {
        userApi.getMe()
            .then(me => setUserRole(me.role))
            .catch(() => setUserRole('USER'));
        resourceApi.getAll()
            .then(data => {
                setResources(propProjectId ? data.filter(r => r.projectId === propProjectId) : data);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));

        if (!propProjectId) {
            projectApi.getProjects()
                .then(data => setProjects(Array.isArray(data) ? data : []))
                .catch(console.error)
                .finally(() => setIsProjectsLoading(false));
        } else {
            setIsProjectsLoading(false);
        }
    }, [propProjectId]);

    const projectMap = projects.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {} as Record<number, string>);

    const handleOpenModal = () => {
        setName('');
        setType('HUMAN');
        setCostPerUnit('');
        setProjectId(propProjectId || (projects.length > 0 ? projects[0].id : ''));
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (projectId === '') return;
        setSaving(true);
        try {
            const created = await resourceApi.create({
                projectId: Number(projectId),
                name,
                type,
                costPerUnit: costPerUnit !== '' ? Number(costPerUnit) : null,
            });
            setResources(prev => [...prev, created]);
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to create resource', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить этот ресурс?')) return;
        try {
            await resourceApi.delete(id);
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Failed to delete resource', err);
        }
    };

    const noProjects = !propProjectId && !isProjectsLoading && projects.length === 0;

    const content = (
        <>
            <div className="p-8 md:p-10 min-h-full bg-gray-50/50">
            <div className="max-w-6xl mx-auto">
                {}
                <div className={`flex flex-col sm:flex-row ${propProjectId ? 'justify-end' : 'justify-between'} items-start sm:items-center gap-4 mb-8`}>
                    {!propProjectId && (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-purple-600" />
                            </span>
                            Ресурсы
                        </h1>
                        <p className="text-gray-400 text-sm mt-1 ml-12">Материалы, люди и инструменты по проектам</p>
                    </div>
                    )}
                    {canManage && (
                        <button
                            onClick={handleOpenModal}
                            disabled={(!propProjectId && isProjectsLoading) || noProjects}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Добавить ресурс
                        </button>
                    )}
                </div>

                    {noProjects && (
                        <div className="mb-6 p-4 rounded-xl bg-blue-50 text-blue-700 text-sm border border-blue-100 flex items-center gap-3">
                            <Package className="w-5 h-5 text-blue-500 shrink-0" />
                            <p>Для добавления ресурсов необходимо сначала создать хотя бы один проект.</p>
                        </div>
                    )}

                    {}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        ) : resources.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <Package className="w-12 h-12 text-gray-300 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">Нет ресурсов</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                    Ресурсы ещё не добавлены.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {!propProjectId && <th className="px-6 py-3">Проект</th>}
                                            <th className="px-6 py-3">Название</th>
                                            <th className="px-6 py-3">Тип</th>
                                            <th className="px-6 py-3">Стоимость / ед.</th>
                                            <th className="px-6 py-3 text-right">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {resources.map(r => (
                                            <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                                                {!propProjectId && (
                                                <td className="px-6 py-4 text-gray-600 font-medium">
                                                    {projectMap[r.projectId] || `Проект ${r.projectId}`}
                                                </td>
                                                )}
                                                <td className="px-6 py-4 font-medium text-gray-800">{r.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[r.type] || 'bg-gray-100 text-gray-600'}`}>
                                                        {TYPE_LABELS[r.type] || r.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {r.costPerUnit != null ? `${r.costPerUnit.toLocaleString('en-US')} $` : '—'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {canManage && (
                                                        <button
                                                            onClick={() => handleDelete(r.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Удалить"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Новый ресурс</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
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
                                        onClick={() => setOpenDropdown(openDropdown === 'project' ? null : 'project')}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                    >
                                        <span className={projectId === '' ? 'text-gray-400' : 'text-gray-900'}>
                                            {projectId !== '' ? (projects.find(p => p.id === projectId)?.name ?? 'Проект') : 'Выберите проект'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'project' ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openDropdown === 'project' && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                            {projects.map(p => (
                                                <button key={p.id} type="button"
                                                    onClick={() => { setProjectId(p.id); setOpenDropdown(null); }}
                                                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${projectId === p.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                >{p.name}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}

                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Название <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                    placeholder="Иван Петров / Сталь листовая / AutoCAD"
                                />
                            </div>

                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                                    >
                                        <span className="font-medium text-gray-900">{TYPE_LABELS[type]}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openDropdown === 'type' && (
                                        <div className="absolute z-20 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                            {TYPES.map(t => (
                                                <button key={t} type="button"
                                                    onClick={() => { setType(t); setOpenDropdown(null); }}
                                                    className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${type === t ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'}`}
                                                >{TYPE_LABELS[t]}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость / единица ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={costPerUnit}
                                    onChange={e => setCostPerUnit(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                    placeholder="Необязательно"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                                    Отмена
                                </button>
                                <button type="submit" disabled={saving || projectId === ''}
                                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2">
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

export default ResourcesPage;
