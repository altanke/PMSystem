
export type ProjectStatusKey = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

export interface ProjectStatusInfo {
    key: ProjectStatusKey;
    label: string;

    badgeClass: string;

    dotClass: string;
}

const STATUS_MAP: Record<ProjectStatusKey, ProjectStatusInfo> = {
    PLANNED: {
        key: 'PLANNED',
        label: 'Запланирован',
        badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
        dotClass: 'bg-gray-400',
    },
    IN_PROGRESS: {
        key: 'IN_PROGRESS',
        label: 'В работе',
        badgeClass: 'bg-blue-50 text-blue-600 border-blue-200',
        dotClass: 'bg-blue-500',
    },
    COMPLETED: {
        key: 'COMPLETED',
        label: 'Завершён',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
    },
};

export function getProjectStatus(progressPercentage?: number | null): ProjectStatusInfo {
    const progress = progressPercentage ?? 0;
    if (progress >= 100) return STATUS_MAP.COMPLETED;
    if (progress > 0) return STATUS_MAP.IN_PROGRESS;
    return STATUS_MAP.PLANNED;
}
