import api from './axios';

export interface Resource {
    id: number;
    projectId: number;
    name: string;
    type: string;
    costPerUnit: number | null;
}

export interface CreateResourceRequest {
    projectId: number;
    name: string;
    type: string;
    costPerUnit: number | null;
}

export const resourceApi = {
    getAll: async (): Promise<Resource[]> => {
        const response = await api.get('/api/v1/resources');
        return response.data;
    },

    getByProject: async (projectId: number): Promise<Resource[]> => {
        const response = await api.get(`/api/v1/resources/project/${projectId}`);
        return response.data;
    },

    create: async (data: CreateResourceRequest): Promise<Resource> => {
        const response = await api.post('/api/v1/resources', data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/v1/resources/${id}`);
    },
};
