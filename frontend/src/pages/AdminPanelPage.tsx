import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Crown, UserCheck, ChevronDown, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userApi } from '../api/userApi';
import type { UserProfile } from '../api/userApi';

const ALL_ROLES = ['USER', 'MANAGER', 'ADMIN'] as const;

const ROLE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
    ADMIN:   { label: 'Администратор', badgeClass: 'bg-purple-100 text-purple-700' },
    MANAGER: { label: 'Менеджер',      badgeClass: 'bg-blue-100 text-blue-700' },
    USER:    { label: 'Пользователь',  badgeClass: 'bg-gray-100 text-gray-600' },
};

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const cfg = ROLE_CONFIG[role] ?? { label: role, badgeClass: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badgeClass}`}>
            {cfg.label}
        </span>
    );
};

interface Toast { id: number; message: string; type: 'success' | 'error' }

const AdminPanelPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [toastCounter, setToastCounter] = useState(0);

    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const addToast = (message: string, type: 'success' | 'error') => {
        const id = toastCounter + 1;
        setToastCounter(id);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    useEffect(() => {
        const init = async () => {
            try {
                const me = await userApi.getMe();
                setCurrentUser(me);
                if (me.role !== 'ADMIN') { setAccessDenied(true); setLoading(false); return; }
                const allUsers = await userApi.getAllUsers();
                setUsers(allUsers);
            } catch { navigate('/dashboard'); }
            finally { setLoading(false); }
        };
        init();
    }, []);

    const handleRoleChange = async (user: UserProfile, newRole: string) => {
        setOpenDropdownId(null);
        setSavingId(user.id);
        try {
            const updated = await userApi.updateUserRole(user.id, newRole);
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            addToast(`Роль ${user.email} изменена на ${ROLE_CONFIG[newRole]?.label ?? newRole}`, 'success');
        } catch {
            addToast('Ошибка при изменении роли', 'error');
        } finally {
            setSavingId(null);
        }
    };

    const userCount    = users.filter(u => u.role === 'USER').length;
    const adminCount   = users.filter(u => u.role === 'ADMIN').length;
    const managerCount = users.filter(u => u.role === 'MANAGER').length;

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
                </div>
            </DashboardLayout>
        );
    }

    if (accessDenied) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-full gap-4 text-center px-4">
                    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Доступ запрещён</h1>
                    <p className="text-gray-500 max-w-sm">Эта страница доступна только администраторам системы.</p>
                    <button onClick={() => navigate('/dashboard')}
                        className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all">
                        На главную
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id}
                        className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto
                            ${t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                        {t.message}
                    </div>
                ))}
            </div>

            <div className="p-8 md:p-10 min-h-full bg-gray-50/50">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                <Crown className="w-5 h-5 text-purple-600" />
                            </span>
                            Панель администратора
                        </h1>
                        <p className="text-gray-400 text-sm mt-1 ml-12">Управление пользователями системы</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { label: 'Пользователей', value: userCount,    icon: Users,      color: 'text-gray-600',   bg: 'bg-gray-100' },
                            { label: 'Администраторов', value: adminCount, icon: Crown,      color: 'text-purple-600', bg: 'bg-purple-100' },
                            { label: 'Менеджеров',    value: managerCount, icon: UserCheck,  color: 'text-blue-600',   bg: 'bg-blue-100' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible" ref={dropdownRef}>
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700">Все пользователи</h2>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full font-medium">{users.length} записей</span>
                        </div>

                        <div className="overflow-visible">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Имя / Фамилия</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Роль</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map(user => {
                                        const isCurrentUser = currentUser?.id === user.id;
                                        const isSaving = savingId === user.id;
                                        const isOpen = openDropdownId === user.id;
                                        const initials = [user.firstName, user.lastName]
                                            .filter(Boolean).map(s => s![0].toUpperCase()).join('')
                                            || user.email[0].toUpperCase();
                                        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—';

                                        return (
                                            <tr key={user.id} className={`transition-colors relative ${isCurrentUser ? 'bg-purple-50/40' : 'hover:bg-gray-50/70'}`}>
                                                <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                                    #{user.id}
                                                    {isCurrentUser && (
                                                        <span className="ml-1.5 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-semibold">Вы</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0
                                                            ${isCurrentUser ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {initials}
                                                        </div>
                                                        <span className="font-medium text-gray-800">{fullName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                                <td className="px-6 py-4 relative">
                                                    {isCurrentUser ? (
                                                        <RoleBadge role={user.role} />
                                                    ) : (
                                                        <div className="relative w-44">
                                                            <button
                                                                type="button"
                                                                disabled={isSaving}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenDropdownId(isOpen ? null : user.id);
                                                                }}
                                                                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 cursor-pointer relative text-left"
                                                            >
                                                                <span className="block pr-8">
                                                                    {ROLE_CONFIG[user.role]?.label ?? user.role}
                                                                </span>
                                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                                                                    {isSaving ? (
                                                                        <Loader2 className="animate-spin h-4 w-4 text-emerald-600" />
                                                                    ) : (
                                                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                                                    )}
                                                                </div>
                                                            </button>

                                                            {isOpen && (
                                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                                    <div className="py-1">
                                                                        {ALL_ROLES.map(r => (
                                                                            <button
                                                                                key={r}
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRoleChange(user, r);
                                                                                }}
                                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                                                            >
                                                                                {ROLE_CONFIG[r]?.label ?? r}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPanelPage;
