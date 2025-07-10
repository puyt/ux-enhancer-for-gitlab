<template>
    <div class="testing">
        <template
            v-for="([projectPath, element], link) in teleportElements"
            :key="link"
        >
            <teleport
                v-if="element"
                :to="element"
            >
                <template
                    v-for="label in todoLabels.get(link)"
                    :key="label"
                >
                    <GLabel
                        :color="getProjectLabel(projectPath, label)!.color"
                        :label="label"
                        :text-color="getProjectLabel(projectPath, label)!.text_color"
                    />
                </template>
            </teleport>
        </template>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import { uniq } from 'lodash-es';
    import {
        computed,
        nextTick,
        onMounted,
        type Ref,
        ref,
        type ShallowRef,
        shallowRef,
        watch,
    } from 'vue';
    import { useFetch } from '@vueuse/core';
    import { useExtensionStore } from '../store';
    import { Preference } from '../enums';
    import { useMitt } from '../composables/useMitt';
    import GLabel from './GLabel.vue';

    const { on } = useMitt();

    const {
        getSetting,
        getProjectLabels,
        getProjectLabel,
    } = useExtensionStore();

    const todoLinks: ShallowRef<Array<[string, string]>> = shallowRef([]);
    const todoLabels: Ref<Map<string, string>> = ref(new Map());
    const teleportElements: Ref<Record<string, [string, HTMLElement]>> = ref({});

    const projectPaths = computed(() => uniq(todoLinks.value.map(([path]) => path)));

    function extractIssuableLinksOldUi() {
        const values: Array<[string, string]> = [];

        document.querySelectorAll('.todo-item a.todo-target-link')
            .forEach((element) => {
                const href = element.getAttribute('href')
                    ?.substring(1) || '';

                if (!href) {
                    return;
                }

                const splitted = href.split('/-/');
                const projectPath = splitted.length <= 1 ? '' : splitted[0];

                values.push([
                    projectPath,
                    splitted[1] || '',
                ]);

                const targetElement = element.closest('li.todo')
                    ?.querySelector('div.todo-item');
                if (!targetElement || targetElement.children[targetElement.children.length - 1]?.className === 'todo-item__labels') {
                    return;
                }

                const teleportItem = document.createElement('div');
                teleportItem.className = 'todo-item__labels';
                targetElement.append(teleportItem);

                teleportElements.value[href] = [
                    projectPath,
                    teleportItem,
                ];
            });

        todoLinks.value = values;
    }

    function extractIssuableLinks(itemSelector: string, teleportParentSelector: string, teleportTargetSelector: string) {
        const itemElements = document.querySelectorAll(itemSelector);
        if (itemElements.length === 0) {
            return false;
        }

        const values: Array<[string, string]> = [];

        itemElements.forEach((element) => {
            let href = element.getAttribute('href')
                ?.replace(window.location.origin, '') || '';

            if (!href) {
                return;
            }

            if (href.startsWith('/')) {
                href = href.substring(1);
            }

            const splitted = href.split('/-/');
            const projectPath = splitted.length <= 1 ? '' : splitted[0];

            values.push([
                projectPath,
                splitted[1] || '',
            ]);

            const targetElement = element.closest(teleportParentSelector)
                ?.querySelector(teleportTargetSelector);

            if (!targetElement || targetElement.children[targetElement.children.length - 1]?.className === 'todo-item__labels') {
                return;
            }

            const teleportItem = document.createElement('div');
            teleportItem.className = 'todo-item__labels';
            targetElement.append(teleportItem);

            teleportElements.value[href] = [
                projectPath,
                teleportItem,
            ];
        });

        todoLinks.value = values;
    }

    function intialize() {
        if (!getSetting(Preference.TODO_RENDER_LABELS, true)) {
            return;
        }

        extractIssuableLinksOldUi();

        if (!todoLinks.value.length) {
            extractIssuableLinks('ol[data-testid="todo-item-list"] li > a.gl-link', 'li', 'a > div');
        }
    }

    function fetchTodoLabels() {
        todoLinks.value.forEach(([path, link]) => {
            if (!path) {
                return;
            }

            const regex = /^(merge_requests|issues)\/(\d+)/;
            const match = link.match(regex);
            if (!match?.[1] && !match?.[2]) {
                return;
            }

            useFetch(`/api/v4/projects/${encodeURIComponent(path)}/${match[1]}/${match[2]}?is_custom=1`)
                .json()
                .then(({ data }) => {
                    if (data.value?.labels?.length > 0) {
                        todoLabels.value.set(`${path}/-/${link}`, data.value.labels);
                    }
                });
        });
    }

    function fetchProjectLabels() {
        projectPaths.value.forEach((path) => {
            getProjectLabels(path);
        });
    }

    watch(projectPaths, fetchProjectLabels);
    watch(todoLinks, fetchTodoLabels);

    on('graphql-request-completed', async () => {
        await nextTick();

        intialize();
    });

    onMounted(() => {
        intialize();
    });
</script>
