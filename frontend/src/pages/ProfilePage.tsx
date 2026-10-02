import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, User, Mail, AtSign, Shield } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { userApi } from '../api/userApi';
import type { UserProfile } from '../api/userApi';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        userApi.getMe()
            .then(data => {
                setProfile(data);
                setFirstName(data.firstName ?? '');
                setLastName(data.lastName ?? '');
            })
            .catch(() => navigate('/dashboard'))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError(null);
        setSaveSuccess(false);
        setIsSaving(true);
        try {
            const updated = await userApi.updateMe({ firstName, lastName });
            setProfile(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setSaveError(err.response?.data?.message || 'Ошибка сохранения');
        } finally {
            setIsSaving(false);
        }
    };

    const initials = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).map(s => s![0].toUpperCase()).join('')
        : '?';

    return (
        <DashboardLayout>
            <div className="bg-gray-50/50 min-h-full p-8 md:p-10">
                <div className="max-w-xl mx-auto">
                    {}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-400 hover:text-gray-600 mb-8 transition-colors text-sm font-medium bg-white hover:bg-gray-50 border border-gray-200 py-1.5 px-3 rounded-lg w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Назад
                    </button>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                        </div>
                    ) : (
                        <>
                            {}
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl select-none shrink-0">
                                    {initials}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        {[profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.email}
                                    </h1>
                                    <p className="text-sm text-gray-400 mt-0.5">{profile?.role}</p>
                                </div>
                            </div>

                            {}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 space-y-4">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Данные аккаунта</h2>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Email</p>
                                        <p className="text-sm font-medium text-gray-800">{profile?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <AtSign className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Логин</p>
                                        <p className="text-sm font-medium text-gray-800">@{profile?.email?.split('@')[0]}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Shield className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Роль</p>
                                        <p className="text-sm font-medium text-gray-800">{profile?.role ?? '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Редактировать профиль</h2>

                                <form onSubmit={handleSave} className="space-y-5">
                                    {saveError && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
                                            {saveError}
                                        </div>
                                    )}
                                    {saveSuccess && (
                                        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm border border-emerald-100">
                                            ✓ Изменения сохранены
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                                            Имя
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                id="firstName"
                                                type="text"
                                                value={firstName}
                                                onChange={e => setFirstName(e.target.value)}
                                                className="block w-full py-2.5 pl-9 pr-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all"
                                                placeholder="Ваше имя"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1 pl-1">
                                            Фамилия
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                id="lastName"
                                                type="text"
                                                value={lastName}
                                                onChange={e => setLastName(e.target.value)}
                                                className="block w-full py-2.5 pl-9 pr-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm transition-all"
                                                placeholder="Ваша фамилия"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm ${isSaving ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'}`}
                                        >
                                            {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                                            Сохранить
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
