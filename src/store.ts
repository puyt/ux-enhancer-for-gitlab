import { defineStore } from 'pinia';
import {
    computed,
    onMounted,
    type Ref,
    ref,
} from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { APP_NAMESPACE } from './constants';
import {
    fetchProject,
    fetchProjectLabels,
    type IProject,
    type IProjectLabel,
} from './apis/project';
import { fetchGitLabVersion } from './apis/version';
import { fetchCurrentUser } from './apis/user';

type SettingValue = boolean | string | number | null;

export const useExtensionStore = defineStore('resize', () => {
        const gitlabUserId: Ref<number> = ref<number>(0);
        const gitlabUsername: Ref<string> = ref<string>('');
        const gitlabVersion: Ref<string | null> = ref<string | null>(null);

        const isReady = computed(() => !!gitlabUserId.value && !!gitlabVersion.value);

        const valuesByNamespace: Ref<Map<string, SettingValue>> = useLocalStorage(APP_NAMESPACE, ref(new Map()));

        function get(key: string, defaultValue: SettingValue = null): SettingValue {
            const value = valuesByNamespace.value.get(key);
            return value === undefined ? defaultValue : value;
        }

        function set(key: string, value: SettingValue) {
            valuesByNamespace.value.set(key, value);
        }

        // --- GitLab State Cache ---

        const projectLabelsCache: Ref<Map<string, IProjectLabel[]>> = useLocalStorage(`${APP_NAMESPACE}/project-labels`, ref(new Map()));

        async function getProjectLabels(projectPath: string) {
            if (projectLabelsCache.value.has(projectPath)) {
                return projectLabelsCache.value.get(projectPath)!;
            }

            const { data } = await fetchProjectLabels(projectPath);

            projectLabelsCache.value.set(projectPath, data.value ?? []);

            return data.value;
        }

        const projectsCache: Ref<Map<string, IProject>> = useLocalStorage(`${APP_NAMESPACE}/projects`, ref(new Map()));

        async function getProject(projectPath: string) {
            if (projectsCache.value.has(projectPath)) {
                return projectsCache.value.get(projectPath)!;
            }

            const { data } = await fetchProject(projectPath);

            if (!data.value) {
                return null;
            }

            projectsCache.value.set(projectPath, data.value);

            return data.value;
        }

        function clearCache() {
            projectLabelsCache.value.clear();
        }

        async function loadCurrentUser() {
            const { data: user } = await fetchCurrentUser();

            gitlabUserId.value = user.value?.id || 0;
            gitlabUsername.value = user.value?.username || '';
        }

        async function loadGitLabVersion() {
            const { data: gitlabVersionData } = await fetchGitLabVersion();
            gitlabVersion.value = gitlabVersionData.value?.version || null;
        }

        onMounted(() => {
            loadCurrentUser();
            loadGitLabVersion();
        });

        return {
            gitlabUserId,
            gitlabUsername,
            gitlabVersion,
            isReady,

            getSetting: get,
            setSetting: set,

            getProjectLabels,
            getProject,
            clearCache,
        };
    },
);
