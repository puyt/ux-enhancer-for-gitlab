<template>
    <div
        class="gl-pl-4 gl-py-2 gl-font-sm gl-font-weight-bold"
        style="display: flex; align-items: center;"
    >
        <span>Starred Projects</span>
    </div>

    <ul class="gl-mb-0 gl-pl-0 gl-list-style-none">
        <template
            v-for="project in projects"
            :key="project.id"
        >
            <li
                class="show-on-focus-or-hover--context gl-new-dropdown-item"
                tabindex="0"
            >
                <a
                    class="gl-new-dropdown-item-content"
                    :href="project.web_url"
                    style="height: 40px;"
                >
                    <span class="gl-new-dropdown-item-text-wrapper">
                        <div
                            class="gl-gap-3"
                            style="display: flex; align-items: center;"
                        >
                            <img
                                v-if="project.avatar_url"
                                class="gl-avatar gl-avatar-s24"
                                :src="project.avatar_url"
                            >
                            <div
                                v-else
                                class="gl-avatar gl-avatar-s24 gl-align-self-start gl-flex-shrink-0 gl-avatar-identicon gl-avatar-identicon-bg6"
                            >
                                {{ project.name.charAt(0) }}
                            </div>

                            <div class="gl-flex-grow-1 gl-flex-shrink-1 gl-truncate-end">
                                {{ project.name_with_namespace }}
                            </div>

                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: auto;">
                                <a
                                    class="gl-link gl-text-gray-500 has-tooltip"
                                    :href="`${project.web_url}/-/issues`"
                                    title="Issues"
                                >
                                    <SvgIcon
                                        class="gl-mr-2"
                                        :is-gitlab="true"
                                        :path="gSvgIssue"
                                    />

                                    <span>{{ project.open_issues_count }}</span>
                                </a>

                                <a
                                    class="gl-link gl-text-gray-500 has-tooltip"
                                    :href="`${project.web_url}/-/merge_requests?draft=no`"
                                    title="Merge requests"
                                >
                                    <SvgIcon
                                        class="gl-mr-2"
                                        :is-gitlab="true"
                                        :path="gSvgMergeRequest"
                                    />

                                    <span>{{ openMrCountPerProjectId?.[project.id] || 0 }}</span>
                                </a>

                                <a
                                    class="gl-button btn btn-icon btn-sm btn-default has-tooltip"
                                    :href="`${project.web_url}/-/boards?iteration_id=Current`"
                                    title="Issue board"
                                >
                                    <SvgIcon
                                        class="gl-icon s16"
                                        :path="mdiViewDashboardOutline"
                                    />
                                </a>

                                <a
                                    class="gl-button btn btn-icon btn-sm btn-default has-tooltip"
                                    :href="`${project.web_url}/-/pipelines`"
                                    title="Pipelines"
                                >
                                    <SvgIcon
                                        class="gl-icon s16"
                                        :is-gitlab="true"
                                        :path="gSvgPipeline"
                                    />
                                </a>
                            </div>
                        </div>
                    </span>
                </a>
            </li>
        </template>
    </ul>
</template>

<script
    lang="ts"
    setup
>
    import {
        computed,
        onMounted,
        type Ref,
        ref,
        toRefs,
        watch,
    } from 'vue';
    import { useFetch } from '@vueuse/core';
    import type { GitLabProject } from '../types';
    import { mdiViewDashboardOutline } from '@mdi/js';
    import { useExtensionStore } from '../store';
    import {
        gSvgIssue,
        gSvgMergeRequest,
        gSvgPipeline,
    } from '../assets/icons';
    import SvgIcon from './SvgIcon.vue';
    import { useFetchPaging } from '../composables/useFetchPaging';
    import { Preference } from '../enums';

    interface Props {
        gitlabUserId: number,
        match: string,
    }

    const props = withDefaults(defineProps<Props>(), {
        gitlabUserId: 0,
        match: '',
    });
    const {
        gitlabUserId,
        match,
    } = toRefs(props);

    const {
        getSetting,
    } = useExtensionStore();

    const projects: Ref<Array<GitLabProject>> = ref([]);
    const openMrCountPerProjectId: Ref<Record<number, number>> = ref({});

    const isStarredProjectsEnabled = computed(() => !!getSetting(Preference.COMMAND_PANEL_STARRED_PROJECTS, true));

    async function fetchData() {
        if (!isStarredProjectsEnabled.value) {
            return;
        }

        const { data } = await useFetch(`/api/v4/users/${gitlabUserId.value}/starred_projects`)
            .json();

        projects.value = data.value;
        if (match.value !== '') {
            projects.value = projects.value.filter((project) => project.name_with_namespace.toLowerCase()
                .includes(match.value.toLowerCase()));
        }

        projects.value.forEach((project) => {
            useFetchPaging(`/api/v4/projects/${project.id}/merge_requests?state=opened&wip=no`)
                .then(({ data }) => {
                    openMrCountPerProjectId.value[project.id] = data.value.length;
                });
        });
    }

    watch([
        match,
        isStarredProjectsEnabled,
    ], async () => fetchData());

    onMounted(async () => {
        fetchData();
    });
</script>
