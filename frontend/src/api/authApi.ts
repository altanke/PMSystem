import api from './axios';
import type { AuthResponse } from './types';

export const authApi = {
    login: async (login: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/api/v1/auth/login', { login, password });
        return response.data;
    },
    register: async (username: string, email: string, password: string): Promise<any> => {
        const response = await api.post('/api/v1/auth/register', { username, email, password, role: "USER" });
        return response.data;
    },
};
