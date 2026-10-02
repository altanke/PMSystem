import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, ChevronDown, Download } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { projectApi } from '../api/projectApi';
import type { Project, Task } from '../api/projectApi';
import { userApi } from '../api/userApi';
import CreateTaskModal from '../components/projects/CreateTaskModal';
import EditTaskModal from '../components/projects/EditTaskModal';
import ProjectFormModal from '../components/projects/ProjectFormModal';
import GanttChart from '../components/projects/GanttChart';
import RisksPage from './RisksPage';
import ResourcesPage from './ResourcesPage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RobotoRegularBase64 } from '../fonts/Roboto-Regular';
import { getProjectStatus } from '../utils/projectStatus';

const StatusDropdown = ({ task, onStatusChange }: { task: Task, onStatusChange: (t: Task, s: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const lookup: Record<string, { label: string, color: string }> = {
        'TODO': { label: 'К выполнению', color: 'text-gray-500' },
        'IN_PROGRESS': { label: 'В работе', color: 'text-blue-600' },
        'DONE': { label: 'Готово', color: 'text-emerald-600' }
    };

    const current = lookup[task.status || 'TODO'] || lookup['TODO'];

    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyles({
                position: 'absolute',
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX - 8,
                minWidth: Math.max(rect.width + 32, 160),
                zIndex: 9999,
            });
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={handleToggle}
                className={`flex items-center gap-1.5 font-medium text-sm transition-opacity hover:opacity-70 focus:outline-none whitespace-nowrap min-w-[130px] ${current.color}`}
            >
                {current.label}
                <ChevronDown className="w-4 h-4 opacity-70 mt-[1px]" />
            </button>

            {isOpen && document.body && createPortal(
                <div
                    ref={dropdownRef}
                    style={dropdownStyles}
                    className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden py-1.5"
                >
                    {Object.entries(lookup).map(([value, info]) => (
                        <button
                            key={value}
                            onClick={() => {
                                onStatusChange(task, value);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm transition-colors ${task.status === value ? 'bg-emerald-50/50 font-semibold ' + info.color : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${info.color.replace('text', 'bg')}`} />
                            {info.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};

const formatTaskDate = (task: Task, field: 'earlyStart' | 'earlyFinish'): string => {
    const dtField = field === 'earlyStart' ? task.earlyStartDt : task.earlyFinishDt;
    const numField = field === 'earlyStart' ? task.earlyStart : task.earlyFinish;
    if (dtField) return new Date(dtField).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
    if (numField != null) return `${numField}h`;
    return '—';
};

const statusLabel: Record<string, string> = {
    'TODO': 'К выполнению',
    'IN_PROGRESS': 'В работе',
    'DONE': 'Готово',
};

const ProjectDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isCpmLoading, setIsCpmLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'gantt' | 'risks' | 'resources'>('gantt');
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportBtnRef = useRef<HTMLButtonElement>(null);
    const exportDropRef = useRef<HTMLDivElement>(null);
    const [exportDropStyles, setExportDropStyles] = useState<React.CSSProperties>({});

    const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
    const [isProjectDeleting, setIsProjectDeleting] = useState(false);

    const [userRole, setUserRole] = useState<string>('USER');
    const canManage = userRole === 'ADMIN' || userRole === 'MANAGER';

    useEffect(() => {
        loadProjectDetails();
        userApi.getMe()
            .then(me => setUserRole(me.role))
            .catch(() => setUserRole('USER'));
    }, [id]);

    const loadProjectDetails = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const data = await projectApi.getProjectById(Number(id));
            setProject(data);
            const fetchedTasks: Task[] = (data as any).tasks || [];
            setTasks(fetchedTasks.sort((a, b) => a.id - b.id));
        } catch (err) {
            console.error('Failed to load project details', err);
            setError('Не удалось загрузить данные проекта.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCalculateCPM = async () => {
        if (!id) return;
        setIsCpmLoading(true);
        try {
            await projectApi.calculateCPM(Number(id));
            await loadProjectDetails();
        } catch (err) {
            console.error('Failed to calculate CPM', err);
        } finally {
            setIsCpmLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить проект? Это действие необратимо.')) return;
        setIsProjectDeleting(true);
        try {
            await projectApi.deleteProject(Number(id));
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to delete project', err);
            setIsProjectDeleting(false);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm('Удалить задачу? Все её связи тоже будут удалены.')) return;
        try {
            await projectApi.deleteTask(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    const handleStatusChange = async (task: Task, newStatus: string) => {
        try {
            await projectApi.updateTask(task.id, { ...task, status: newStatus });
            await loadProjectDetails();
        } catch (err) {
            console.error('Failed to update task status', err);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isExportOpen &&
                exportDropRef.current && !exportDropRef.current.contains(e.target as Node) &&
                exportBtnRef.current && !exportBtnRef.current.contains(e.target as Node)) {
                setIsExportOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExportOpen]);

    const exportToCSV = () => {
        if (!project) return;
        setIsExportOpen(false);

        const budget = project.totalBudget
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(project.totalBudget)
            : 'Not set';

        const rows: string[][] = [
            ['Аналитический отчёт по проекту'],
            ['Название проекта', project.name],
            ['Прогресс (%)', String(project.progressPercentage ?? 0)],
            ['Бюджет', budget],
            [],
            ['ID', 'Название', 'Длительность (ч)', 'ES', 'EF', 'Резерв (Slack)', 'Статус'],
            ...tasks.map(t => [
                String(t.id),
                t.name,
                String(t.durationEstimateHours),
                formatTaskDate(t, 'earlyStart'),
                formatTaskDate(t, 'earlyFinish'),
                t.slack != null ? String(t.slack) : '—',
                statusLabel[t.status ?? 'TODO'] ?? t.status ?? '—',
            ]),
        ];

        const csvContent = rows
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
            .join('\r\n');

        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'project_report.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportToPDF = () => {
        if (!project) return;
        setIsExportOpen(false);

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        doc.addFileToVFS('Roboto-Regular.ttf', RobotoRegularBase64);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto', 'normal');

        doc.setFontSize(18);
        doc.setTextColor(33, 33, 33);
        doc.text(`Аналитический отчёт по проекту: ${project.name}`, 14, 18);

        const budget = project.totalBudget
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(project.totalBudget)
            : 'Not set';
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Прогресс: ${project.progressPercentage ?? 0}%`, 14, 28);
        doc.text(`Бюджет: ${budget}`, 14, 34);
        doc.text(`Всего задач: ${tasks.length}`, 14, 40);

        doc.setDrawColor(200, 200, 200);
        doc.line(14, 44, 283, 44);

        autoTable(doc, {
            startY: 48,
            head: [['#', 'Название задачи', 'Длительность (ч)', 'ES', 'EF', 'Резерв', 'Статус']],
            body: tasks.map((t, idx) => [
                String(idx + 1),
                t.name,
                String(t.durationEstimateHours),
                formatTaskDate(t, 'earlyStart'),
                formatTaskDate(t, 'earlyFinish'),
                t.slack != null ? String(t.slack) : '—',
                statusLabel[t.status ?? 'TODO'] ?? t.status ?? '—',
            ]),
            styles: {
                font: 'Roboto',
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [16, 185, 129],
                textColor: 255,
                fontStyle: 'normal',
                font: 'Roboto',
                fontSize: 9.5,
            },
            alternateRowStyles: { fillColor: [245, 250, 247] },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 75 },
                2: { cellWidth: 28 },
                3: { cellWidth: 38 },
                4: { cellWidth: 38 },
                5: { cellWidth: 22 },
                6: { cellWidth: 36 },
            },
        });

        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFont('Roboto', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Сформирован: ${new Date().toLocaleString('ru-RU')}   | Страница ${i} из ${pageCount}`,
                14,
                doc.internal.pageSize.getHeight() - 6
            );
        }

        doc.save('project_report.pdf');
    };

    const handleExportToggle = () => {
        if (!isExportOpen && exportBtnRef.current) {
            const rect = exportBtnRef.current.getBoundingClientRect();
            setExportDropStyles({
                position: 'fixed',
                top: rect.bottom + 8,
                left: rect.left,
                minWidth: 180,
                zIndex: 9999,
            });
        }
        setIsExportOpen(prev => !prev);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-full items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !project) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-red-500 mb-4">{error || 'Проект не найден'}</p>
                    <button onClick={() => navigate('/dashboard')} className="text-emerald-600 hover:underline">
                        Вернуться к списку проектов
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="bg-gray-50/50 min-h-full p-8 md:p-10">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center text-gray-400 hover:text-gray-600 mb-6 transition-colors text-sm font-medium bg-white hover:bg-gray-50 border border-gray-200 py-1.5 px-3 rounded-lg w-fit"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Назад
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center flex-wrap gap-4 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
                                    {canManage && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setIsProjectEditOpen(true)}
                                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                title="Редактировать проект"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={handleDeleteProject}
                                                disabled={isProjectDeleting}
                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                                title="Удалить проект"
                                            >
                                                {isProjectDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-500">{project.description || 'Нет описания'}</p>
                            </div>

                            <div className="flex gap-3 items-center">
                                {canManage && (
                                    <>
                                        {}
                                        <div className="relative">
                                            <button
                                                ref={exportBtnRef}
                                                onClick={handleExportToggle}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-medium shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md"
                                            >
                                                <Download className="w-4 h-4" />
                                                Экспорт
                                                <ChevronDown className={`w-4 h-4 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isExportOpen && document.body && createPortal(
                                                <div
                                                    ref={exportDropRef}
                                                    style={exportDropStyles}
                                                    className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden py-1.5"
                                                >
                                                    <button
                                                        onClick={exportToCSV}
                                                        className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                                    >
                                                        <span className="text-base">📊</span>
                                                        Экспорт в CSV
                                                    </button>
                                                    <button
                                                        onClick={exportToPDF}
                                                        className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                                    >
                                                        <span className="text-base">📄</span>
                                                        Экспорт в PDF
                                                    </button>
                                                </div>,
                                                document.body
                                            )}
                                        </div>

                                        <button
                                            onClick={handleCalculateCPM}
                                            disabled={isCpmLoading}
                                            className={`flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white hover:bg-orange-600 rounded-xl font-medium shadow-sm transition-all ${
                                                isCpmLoading ? 'opacity-70 cursor-wait' : 'hover:translate-y-[-2px] hover:shadow-md'
                                            }`}
                                        >
                                            {isCpmLoading
                                                ? <><Loader2 className="w-4 h-4 animate-spin" />Расчет...</>
                                                : 'Рассчитать CPM'
                                            }
                                        </button>
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="flex items-center px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-medium shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md"
                                        >
                                            <Plus className="w-5 h-5 mr-1" />
                                            Добавить задачу
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                            <p className="text-sm text-gray-500 font-medium mb-1">Статус / Прогресс</p>
                            <div className="flex items-center justify-between mb-3">
                                {}
                                {(() => {
                                    const s = getProjectStatus(project.progressPercentage);
                                    return (
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.badgeClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dotClass}`} />
                                            {s.label}
                                        </span>
                                    );
                                })()}
                                <span className="text-sm text-gray-500 font-medium">{project.progressPercentage || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${project.progressPercentage || 0}%` }} />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-center">
                            <p className="text-sm text-gray-500 font-medium mb-1">Всего задач</p>
                            <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-center">
                            <p className="text-sm text-gray-500 font-medium mb-1">Бюджет</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {project.totalBudget
                                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(project.totalBudget)
                                    : 'Not set'}
                            </p>
                        </div>
                    </div>

                    <div className="flex space-x-1 border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab('gantt')}
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'gantt' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Гант и Задачи
                        </button>
                        <button
                            onClick={() => setActiveTab('risks')}
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'risks' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Риски
                        </button>
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'resources' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Ресурсы
                        </button>
                    </div>

                    {activeTab === 'gantt' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="py-4 px-6 font-semibold">#</th>
                                        <th className="py-4 px-6 font-semibold">Название</th>
                                        <th className="py-4 px-6 font-semibold">Длительность (ч)</th>
                                        <th className="py-4 px-6 font-semibold">Предшественники</th>
                                        <th className="py-4 px-6 font-semibold">ES</th>
                                        <th className="py-4 px-6 font-semibold">EF</th>
                                        <th className="py-4 px-6 font-semibold">Резерв (Slack)</th>
                                        <th className="py-4 px-6 font-semibold">Статус</th>
                                        <th className="py-4 px-6 font-semibold text-right">Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-gray-500">
                                                У этого проекта пока нет задач
                                            </td>
                                        </tr>
                                    ) : (
                                        tasks.map((task) => (
                                            <tr
                                                key={task.id}
                                                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${task.slack === 0 ? 'bg-red-50/50 hover:bg-red-100/50' : ''}`}
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-500">{tasks.indexOf(task) + 1}</td>
                                                <td className="px-6 py-4 text-gray-800">{task.name}</td>
                                                <td className="px-6 py-4 text-gray-800">{task.durationEstimateHours}</td>
                                                <td className="px-6 py-4 text-gray-800">
                                                    {task.predecessors?.length > 0
                                                        ? task.predecessors
                                                            .map(pid => tasks.find(t => t.id === pid.taskId)?.name ?? `#${pid.taskId}`)
                                                            .join(', ')
                                                        : '—'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-800 text-xs">
                                                    {task.earlyStartDt
                                                        ? new Date(task.earlyStartDt).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
                                                        : (task.earlyStart != null ? `${task.earlyStart}ч` : '—')}
                                                </td>
                                                <td className="px-6 py-4 text-gray-800 text-xs">
                                                    {task.earlyFinishDt
                                                        ? new Date(task.earlyFinishDt).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
                                                        : (task.earlyFinish != null ? `${task.earlyFinish}ч` : '—')}
                                                </td>
                                                <td className={`px-6 py-4 font-semibold ${task.slack === 0 ? 'text-rose-600' : 'text-gray-800'}`}>
                                                    {task.slack ?? '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusDropdown task={task} onStatusChange={handleStatusChange} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingTask(task)}
                                                            title="Редактировать"
                                                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        {canManage && (
                                                            <button
                                                                onClick={() => handleDeleteTask(task.id)}
                                                                title="Удалить"
                                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <GanttChart tasks={tasks} />
                </div>
            )}

                    {activeTab === 'risks' && (
                        <div className="-mx-8 md:-mx-10 -mt-8">
                            <RisksPage projectId={Number(id)} />
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="-mx-8 md:-mx-10 -mt-8">
                            <ResourcesPage projectId={Number(id)} />
                        </div>
                    )}
                </div>
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                projectId={Number(id)}
                onTaskCreated={loadProjectDetails}
                existingTasks={tasks}
            />

            {editingTask && (
                <EditTaskModal
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    task={editingTask}
                    onTaskUpdated={() => {
                        setEditingTask(null);
                        loadProjectDetails();
                    }}
                />
            )}

            <ProjectFormModal
                isOpen={isProjectEditOpen}
                onClose={() => setIsProjectEditOpen(false)}
                onProjectSaved={loadProjectDetails}
                projectToEdit={project}
            />
        </DashboardLayout>
    );
};

export default ProjectDetailsPage;
