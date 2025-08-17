<template>
    <div
        class="gl-pl-4 gl-py-2 gl-font-sm gl-font-weight-bold"
        style="display: flex; align-self: center;"
    >
        <span>Starred Boards</span>
    </div>

    <ul class="gl-mb-0 gl-pl-0 gl-list-style-none">
        <template
            v-for="([boardId, board]) in filteredBoards"
            :key="boardId"
        >
            <li
                class="show-on-focus-or-hover--context gl-new-dropdown-item"
                tabindex="0"
            >
                <div style="display: flex; align-items: center; width: 100%;">
                        <a
                            class="gl-new-dropdown-item-content"
                            :href="board.href"
                            style="height: 48px; flex: 1; display: flex; align-items: center; justify-content: space-between;"
                        >
                            <span class="gl-new-dropdown-item-text-wrapper" style="flex: 1;">
                                <div
                                    class="gl-gap-3"
                                    style="display: flex; align-items: center;"
                                >
                                    <template v-if="projectInfo?.[board.projectPath]">
                                        <img
                                            v-if="projectInfo[board.projectPath].avatar_url"
                                            class="gl-avatar gl-avatar-s24"
                                            :src="projectInfo[board.projectPath].avatar_url"
                                        >
                                        <div
                                            v-else
                                            class="gl-avatar gl-avatar-s24 gl-align-self-start gl-flex-shrink-0 gl-avatar-identicon gl-avatar-identicon-bg6"
                                        >
                                            {{ projectInfo[board.projectPath].name.charAt(0) }}
                                        </div>
                                    </template>

                                    <div class="gl-flex-grow-1 gl-flex-shrink-1 gl-truncate-end">
                                        {{ board.label }}

                                        <div
                                            v-if="projectInfo?.[board.projectPath]"
                                            class="gl-font-sm gl-text-gray-500 gl-text-truncate"
                                        >
                                            {{ projectInfo[board.projectPath]?.name_with_namespace || '' }}
                                        </div>
                                    </div>
                                </div>
                            </span>
                            <div
                                class="gl-ml-2 gl-button gl-button-icon has-tooltip"
                                style="background: none; border: none; cursor: pointer; color: #d9534f; display: flex; align-items: center;"
                                title="Unstar board"
                                @click.stop.prevent="unstarBoard(boardId)"
                            >
                                <SvgIcon
                                    :path="gSvgTrash"
                                    :is-gitlab="true"
                                />
                            </div>
                        </a>
                </div>
            </li>
        </template>
    </ul>
</template>

<script
    lang="ts"
    setup
>
        import {
            useFetch,
            useLocalStorage,
        } from '@vueuse/core';
        import {
            computed,
            ref,
            watch,
        } from 'vue';
        import { debounce } from 'lodash-es';
        import SvgIcon from './SvgIcon.vue';
        import { gSvgTrash } from '../assets/icons';

    interface Props {
        match?: string,
    }

    const { match = '' } = defineProps<Props>();

    const starredBoards = useLocalStorage('glab-enhancer-browser-extension/starred-boards', ref(new Map()));

    function unstarBoard(boardId: string) {
        if (starredBoards.value.has(boardId)) {
            starredBoards.value.delete(boardId);
        }
    }

    const filteredBoards = computed(() => {
        const newMap = new Map();

        starredBoards.value.forEach((data, boardId) => {
            if (!match || data.label.toLowerCase()
                .includes(match.toLowerCase())) {
                newMap.set(boardId, {
                    ...data,
                    href: `${data.pathname.split('boards/')[0]}/boards/${boardId.split('listbox-item-')[1]}`,
                    projectPath: data.pathname.split('/-/')[0],
                });
            }
        });

        return newMap;
    });

    const projectPaths = computed(() => {
        const paths: string[] = [];

        filteredBoards.value.forEach((data) => {
            if (data.projectPath && !paths.includes(data.projectPath)) {
                paths.push(data.projectPath);
            }
        });

        return paths;
    });

    const projectInfo = ref<Record<string, any>>({});

    async function fetchProject(path: string) {
        if (path.charAt(0) === '/') {
            path = path.slice(1);
        }

        if (!path.startsWith('groups')) {
            path = `projects/${encodeURIComponent(path)}`;
        }

        const { data } = await useFetch(`/api/v4/${path}?is_custom=1`)
            .json();

        return data?.value || null;
    }

    function fetchProjects() {
        projectPaths.value.forEach((path) => {
            fetchProject(path)
                .then((project) => {
                    projectInfo.value[path] = {
                        avatar_url: project.avatar_url,
                        name: project.name,
                        name_with_namespace: project.name_with_namespace || project.full_name,
                    };
                });
        });
    }

    const debouncedFetchProjects = debounce(fetchProjects, 100);

    watch(projectPaths, debouncedFetchProjects, { immediate: true });
</script>
