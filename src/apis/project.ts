export interface IProjectLabel {
    id: number;
    name: string;
    text_color: string;
    color: string;
    priority: number | null;
    is_project_label: boolean;
}

import { useFetchData } from '../composables/useFetchData';

export async function fetchProjectLabels(projectPath: string) {
    return useFetchData<IProjectLabel[]>(`/api/v4/projects/${encodeURIComponent(projectPath)}/labels`);
}
