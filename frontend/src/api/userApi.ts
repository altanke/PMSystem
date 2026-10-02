import api from './axios';

export interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
}

export interface UpdateProfilePayload {
    firstName: string;
    lastName: string;
}

export const userApi = {
    getMe: async (): Promise<UserProfile> => {
        const response = await api.get<UserProfile>('/api/v1/users/me');
        return response.data;
    },
    updateMe: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
        const response = await api.put<UserProfile>('/api/v1/users/me', payload);
        return response.data;
    },
    getAllUsers: async (): Promise<UserProfile[]> => {
        const response = await api.get<UserProfile[]>('/api/v1/users');
        return response.data;
    },
    updateUserRole: async (userId: number, role: string): Promise<UserProfile> => {
        const response = await api.put<UserProfile>(`/api/v1/users/${userId}/role`, { role });
        return response.data;
    },
};
