import api from "./axios";

export interface Risk {
  id: number;
  projectId: number;
  title: string;
  description: string;
  level: string;
  status: string;
}

export interface RiskPage {
  content: Risk[];
  totalPages: number;
  totalElements: number;
}

export const riskApi = {
  getAllRisks: async (
    page: number = 0,
    size: number = 50,
  ): Promise<RiskPage> => {
    const response = await api.get("/api/v1/risks", { params: { page, size } });
    return response.data;
  },

  createRisk: async (data: Omit<Risk, "id">): Promise<Risk> => {
    const response = await api.post("/api/v1/risks", data);
    return response.data;
  },

  updateRisk: async (id: number, data: Omit<Risk, "id">): Promise<Risk> => {
    const response = await api.put(`/api/v1/risks/${id}`, data);
    return response.data;
  },

  deleteRisk: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/risks/${id}`);
  },
};
