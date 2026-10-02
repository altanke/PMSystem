import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = new URLSearchParams(location.search).get('token');
        if (token) {
            localStorage.setItem('token', token);

            window.location.href = '/dashboard';
        } else {
            console.error('OAuth2 redirect: no token in URL', location.search);
            navigate('/login?error=no_token_received', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm font-medium">Авторизация...</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
