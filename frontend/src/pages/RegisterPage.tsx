import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Loader2 } from 'lucide-react';
import { authApi } from '../api/authApi';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            await authApi.register(username, email, password);
            setSuccess('Регистрация прошла успешно!');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка регистрации');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4 flex-col">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full space-y-10 border border-gray-200">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-semibold text-gray-800 tracking-tight">
                        Регистрация
                    </h2>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        Создайте аккаунт для доступа к системе
                    </p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50/50 text-red-600 p-4 rounded-2xl text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-emerald-50/50 text-emerald-600 p-4 rounded-2xl text-sm text-center border border-emerald-100">
                            {success}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 pl-1">
                                Логин
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full py-2 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm transition-all"
                                    placeholder="Ваш уникальный логин"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 pl-1">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full py-2 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm transition-all"
                                    placeholder="mail@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 pl-1">
                                Пароль
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full py-2 pl-10 pr-4 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 space-y-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 shadow-sm transition-all ${isLoading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'}`}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Зарегистрироваться'
                            )}
                        </button>

                        {}
                        <div className="relative flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 font-medium shrink-0">или</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {}
                        <button
                            type="button"
                            onClick={() => { window.location.href = 'http://localhost:8081/oauth2/authorization/google'; }}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                            </svg>
                            Зарегистрироваться через Google
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                                Уже есть аккаунт? Войти
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
