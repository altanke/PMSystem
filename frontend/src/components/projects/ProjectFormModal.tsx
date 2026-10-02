import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Globe, Lock, ChevronDown, Check, Users } from 'lucide-react';
import { projectApi } from '../../api/projectApi';
import { userApi, type UserProfile } from '../../api/userApi';
import type { Project } from '../../api/projectApi';

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectSaved: () => void;
    projectToEdit?: Project;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, onProjectSaved, projectToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [publicAccess, setPublicAccess] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
    const [currentUserRole, setCurrentUserRole] = useState('USER');

    useEffect(() => {
        if (!isOpen) return;

        userApi.getMe()
            .then(me => setCurrentUserRole(me.role))
            .catch(() => setCurrentUserRole('USER'));

        if (projectToEdit) {
            setName(projectToEdit.name || '');
            setDescription(projectToEdit.description || '');
            setStartDate(projectToEdit.startDate || new Date().toISOString().split('T')[0]);
            setPublicAccess(projectToEdit.publicAccess ?? false);
            setSelectedParticipants(projectToEdit.participantIds || []);
        } else {
            setName('');
            setDescription('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setPublicAccess(false);
            setSelectedParticipants([]);
        }
        setUsersLoading(true);
        userApi.getAllUsers()
            .then(users => setAllUsers(users.filter(u => u.role === 'USER')))
            .catch(() => setAllUsers([]))
            .finally(() => setUsersLoading(false));
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (isDropdownOpen &&
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isDropdownOpen]);

    const handleDropdownToggle = () => {
        if (!isDropdownOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom - 16;
            const maxDropHeight = Math.max(150, spaceBelow);

            setDropdownStyles({
                position: 'fixed',
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
                maxHeight: maxDropHeight,
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
            });
        }
        setIsDropdownOpen(!isDropdownOpen);
    };

    if (!isOpen) return null;

    const toggleParticipant = (id: number) => {
        setSelectedParticipants(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const selectedUsers = allUsers.filter(u => selectedParticipants.includes(u.id));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const payload = {
                name,
                description,
                startDate,
                publicAccess,
                participantIds: selectedParticipants,
            };

            if (projectToEdit) {
                await projectApi.updateProject(projectToEdit.id, payload);
            } else {
                await projectApi.createProject(payload);
            }
            onProjectSaved();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка сохранения проекта');
        } finally {
            setIsLoading(false);
        }
    };

    const isAdminOrManager = currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {projectToEdit ? 'Редактировать проект' : 'Создать проект'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-50/50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {}
                    <div className="space-y-1.5">
                        <label htmlFor="proj-name" className="block text-sm font-medium text-gray-700">Название</label>
                        <input
                            id="proj-name"
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="block w-full py-3 px-4 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all"
                            placeholder="Название проекта"
                        />
                    </div>

                    {}
                    <div className="space-y-1.5">
                        <label htmlFor="proj-date" className="block text-sm font-medium text-gray-700">Дата начала</label>
                        <input
                            id="proj-date"
                            type="date"
                            required
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="block w-full py-3 px-4 bg-gray-50 border-0 rounded-2xl text-gray-900 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all"
                        />
                    </div>

                    {}
                    <div className="space-y-1.5">
                        <label htmlFor="proj-desc" className="block text-sm font-medium text-gray-700">Описание</label>
                        <textarea
                            id="proj-desc"
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="block w-full py-3 px-4 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all resize-none"
                            placeholder="Описание проекта..."
                        />
                    </div>

                    {isAdminOrManager && (
                        <>
                            {}
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                            {publicAccess
                                ? <Globe className="w-5 h-5 text-emerald-600" />
                                : <Lock className="w-5 h-5 text-gray-400" />
                            }
                            <div>
                                <p className="text-sm font-medium text-gray-700">Доступен для всех</p>
                                <p className="text-xs text-gray-400">
                                    {publicAccess ? 'Все исполнители видят этот проект' : 'Только добавленные участники'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const newValue = !publicAccess;
                                setPublicAccess(newValue);
                                if (newValue) {
                                    setSelectedParticipants([]);
                                }
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${publicAccess ? 'bg-emerald-500' : 'bg-gray-200'}`}
                            role="switch"
                            aria-checked={publicAccess}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${publicAccess ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {}
                    {!publicAccess && (
                        <div className="space-y-1.5" ref={dropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Users className="w-4 h-4" /> Участники проекта
                            </label>

                        {}
                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {selectedUsers.map(u => (
                                    <span key={u.id} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                                        {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.username}
                                        <button
                                            type="button"
                                            onClick={() => toggleParticipant(u.id)}
                                            className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {}
                        <button
                            ref={buttonRef}
                            type="button"
                            onClick={handleDropdownToggle}
                            className="flex items-center justify-between w-full py-2.5 px-4 bg-gray-50 rounded-2xl text-sm text-left hover:bg-gray-100 transition-colors"
                        >
                            <span className={selectedParticipants.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                                {selectedParticipants.length === 0 ? 'Выберите участников...' : `Выбрано: ${selectedParticipants.length}`}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && document.body && createPortal(
                            <div
                                ref={dropdownRef}
                                style={dropdownStyles}
                                className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden"
                            >
                                {usersLoading ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                    </div>
                                ) : allUsers.length === 0 ? (
                                    <p className="p-4 text-sm text-gray-400 text-center">Нет пользователей</p>
                                ) : (
                                    <ul className="flex-1 overflow-y-auto py-1 overscroll-contain">
                                        {allUsers.map(u => {
                                            const selected = selectedParticipants.includes(u.id);
                                            return (
                                                <li key={u.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleParticipant(u.id)}
                                                        className={`flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm transition-colors ${selected ? 'bg-emerald-50 text-emerald-800' : 'text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                                            {selected && <Check className="w-3 h-3 text-white" />}
                                                        </span>
                                                        <span>
                                                            <span className="font-medium">{[u.firstName, u.lastName].filter(Boolean).join(' ') || u.username}</span>
                                                            <span className="text-gray-400 ml-1.5 text-xs">({u.email})</span>
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>,
                            document.body
                        )}
                        </div>
                    )}
                        </>
                    )}

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
                            {projectToEdit ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectFormModal;
