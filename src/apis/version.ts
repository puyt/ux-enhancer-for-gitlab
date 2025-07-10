import { useFetchData } from '../composables/useFetchData';

export interface IGitLabVersionResponse {
    enterprise: boolean;
    version: string;
}

export async function fetchGitLabVersion() {
    return useFetchData<IGitLabVersionResponse>('/api/v4/version');
}