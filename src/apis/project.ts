export interface IProject {
    id: number;
    description: string;
    default_branch: string;
    name: string;
    name_with_namespace: string;
    path: string;
    path_with_namespace: string;
    avatar_url: string;
}

export interface IProjectLabel {
    id: number;
    name: string;
    text_color: string;
    color: string;
    priority: number | null;
    is_project_label: boolean;
}

import { useFetchData } from '../composables/useFetchData';

export async function fetchProject(projectPath: string) {
    return useFetchData<IProject>(`/api/v4/projects/${encodeURIComponent(projectPath)}`);
}

export async function fetchProjectLabels(projectPath: string) {
    return useFetchData<IProjectLabel[]>(`/api/v4/projects/${encodeURIComponent(projectPath)}/labels`);
}
