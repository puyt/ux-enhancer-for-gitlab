import { useFetchData } from '../composables/useFetchData';

export interface IUserResponse {
    id: number;
    name: string;
    username: string;
}

export async function fetchCurrentUser() {
    return useFetchData<IUserResponse>('/api/v4/user');
}