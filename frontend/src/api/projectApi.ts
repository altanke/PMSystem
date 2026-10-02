import api from "./axios";

export interface Project {
  id: number;
  name: string;
  description: string;
  startDate?: string;
  progressPercentage?: number;
  totalBudget?: number;
  status?: string;
  publicAccess?: boolean;
  participantIds?: number[];
  tasks?: Task[];
}

export interface TaskDependency {
  taskId: number;
  dependencyType: string;
  lagTimeHours: number;
}

export interface Task {
  id: number;
  projectId: number;
  name: string;
  description: string;
  durationEstimateHours: number;
  status?: string;
  predecessors: TaskDependency[];
  earlyStart?: number;
  earlyFinish?: number;
  lateStart?: number;
  lateFinish?: number;
  slack?: number;
  isCritical?: boolean;
  earlyStartDt?: string;
  earlyFinishDt?: string;
  lateStartDt?: string;
  lateFinishDt?: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  startDate?: string;
  publicAccess?: boolean;
  participantIds?: number[];
}

export const projectApi = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get("/api/v1/projects");
    console.log("API Response:", response.data);
    return Array.isArray(response.data)
      ? response.data
      : response.data?.content || [];
  },
  createProject: async (payload: CreateProjectPayload): Promise<Project> => {
    const response = await api.post<Project>("/api/v1/projects", payload);
    return response.data;
  },
  updateProject: async (
    id: number,
    payload: Partial<CreateProjectPayload>,
  ): Promise<Project> => {
    const response = await api.put<Project>(`/api/v1/projects/${id}`, payload);
    return response.data;
  },
  getProjectById: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/api/v1/projects/${id}`);
    return response.data;
  },
  createTask: async (task: Partial<Task>): Promise<Task> => {
    const response = await api.post<Task>("/api/v1/tasks", task);
    return response.data;
  },
  calculateCPM: async (projectId: number): Promise<any> => {
    const response = await api.post(
      `/api/v1/projects/${projectId}/calculate-cpm`,
    );
    return response.data;
  },
  updateTask: async (taskId: number, task: Partial<Task>): Promise<Task> => {
    const response = await api.put<Task>(`/api/v1/tasks/${taskId}`, task);
    return response.data;
  },
  deleteTask: async (taskId: number): Promise<void> => {
    await api.delete(`/api/v1/tasks/${taskId}`);
  },
  deleteProject: async (projectId: number): Promise<void> => {
    await api.delete(`/api/v1/projects/${projectId}`);
  },
};
