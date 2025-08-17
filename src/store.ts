import { useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import {
    computed,
    onMounted,
    type Ref,
    ref,
} from 'vue';
import {
    fetchProject,
    fetchProjectLabels,
    type IProject,
    type IProjectLabel,
} from './apis/project';
import { fetchCurrentUser } from './apis/user';
import { fetchGitLabVersion } from './apis/version';
import { APP_NAMESPACE } from './constants';

type SettingValue = boolean | string | number | null;

export const useExtensionStore = defineStore(`${APP_NAMESPACE}/app`, () => {
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

        const projectScopedLabelsByPrefixCache = computed(() => {
            const scopedGroupsMap = new Map<string, IProjectLabel[]>();

            const projectLabels = Array.from(projectLabelsCache.value.entries());
            if (projectLabels.length === 0) {
                return scopedGroupsMap;
            }

            projectLabels.forEach(([projectPath, labels]) => {
                const scopedLabels = labels.filter(label => label.name.includes('::'));

                scopedLabels.forEach((scopedLabel) => {
                    const prefix = scopedLabel.name.split('::')[0];
                    const mapKey = `${projectPath}__${prefix}`;

                    const values = scopedGroupsMap.get(mapKey) || [];
                    values.push(scopedLabel);

                    scopedGroupsMap.set(mapKey, values);
                });
            });

            return scopedGroupsMap;
        });

        const projectLabelsCacheByKey = computed(() => {
            const labelsMap = new Map<string, IProjectLabel>();

            const projectLabels = Array.from(projectLabelsCache.value.entries());
            if (projectLabels.length === 0) {
                return labelsMap;
            }

            projectLabels.forEach(([projectPath, labels]) => {
                labels.forEach((scopedLabel) => {
                    const mapKey = `${projectPath}__${scopedLabel.name}`;

                    labelsMap.set(mapKey, scopedLabel);
                });
            });

            return labelsMap;
        });

        async function getProjectLabels(projectPath: string) {
            if (projectLabelsCache.value.has(projectPath)) {
                return projectLabelsCache.value.get(projectPath)!;
            }

            const { data } = await fetchProjectLabels(projectPath);

            const labels = data.value || [];

            projectLabelsCache.value.set(projectPath, labels);

            return labels;
        }

        function getProjectScopedLabels(projectPath: string, prefix: string) {
            return projectScopedLabelsByPrefixCache.value.get(`${projectPath}__${prefix}`) || [];
        }

        function getProjectLabel(projectPath: string, label: string) {
            return projectLabelsCacheByKey.value.get(`${projectPath}__${label}`) || null;
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
            projectsCache.value.clear();
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
            getProjectScopedLabels,
            getProjectLabel,
            projectScopedLabelsByPrefixCache,
            projectLabelsCache,

            getProject,

            clearCache,
        };
    },
);
