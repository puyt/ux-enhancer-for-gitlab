<template>
    <div>
        <template
            v-for="(element, scope) in teleportElements"
            :key="scope"
        >
            <teleport
                v-if="selectedProjectPath && element"
                :to="element"
            >
                <SvgIcon
                    :path="mdiChevronDown"
                    style="margin: -1px; pointer-events: none;"
                />

                <ul
                    :class="{
                        'show': selectedScope === scope,
                    }"
                    class="dropdown-menu"
                    :style="{
                        left: offsetLeft,
                    }"
                    style="width: 240px;"
                >
                    <div class="gl-dropdown-inner">
                        <div class="gl-dropdown-contents">
                            <template
                                v-for="label in getProjectScopedLabels(selectedProjectPath, scope)"
                                :key="label.name"
                            >
                                <li
                                    class="gl-dropdown-item"
                                    style="padding: 8px 16px;"
                                    @click="updateIssueLabel(label.name)"
                                >
                                    <GLabel
                                        :color="label.color"
                                        class="gl-mb-0! gl-mr-0!"
                                        :is-small="false"
                                        :label="label.name"
                                        :text-color="label.text_color"
                                    />
                                </li>
                            </template>
                        </div>
                    </div>
                </ul>
            </teleport>
        </template>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import { mdiChevronDown } from '@mdi/js';
    import { useFetch } from '@vueuse/core';
    import { debounce } from 'lodash-es';
    import {
        computed,
        onBeforeUnmount,
        onMounted,
        type Ref,
        ref,
    } from 'vue';
    import { storeToRefs } from 'pinia';
    import { useExtractProjectPaths } from '../composables/useExtractProjectPaths';
    import { useMitt } from '../composables/useMitt';
    import { usePageDetectionStore } from '../stores';
    import { MittEventKey } from '../enums';
    import { useExtensionStore } from '../store';
    import GLabel from './GLabel.vue';
    import SvgIcon from './SvgIcon.vue';

    interface Props {
        currentProjectPath?: string,
        csrfToken?: string,
        iid?: number,
    }

    const {
        currentProjectPath = '',
        csrfToken = '',
        iid = 0,
    } = defineProps<Props>();

    const {
        getProjectLabels,
        getProjectScopedLabels,
    } = useExtensionStore();

    const { isBoardPage } = storeToRefs(usePageDetectionStore());

    const { extract: extractProjectPaths } = useExtractProjectPaths();

    const {
        on,
        off,
    } = useMitt();

    const teleportElements: Ref<Record<string, HTMLElement>> = ref({});
    const selectedScope = ref('');
    const offsetLeft = ref('0');

    const selectedIid = computed(() => {
        if (iid) {
            return iid;
        }

        if (isBoardPage.value) {
            return parseInt(document.querySelector('li.board-card.is-active')
                ?.getAttribute('data-item-iid') || '0');
        }

        return 0;
    });

    const selectedProjectPath = computed(() => {
        if (currentProjectPath) {
            return currentProjectPath;
        }

        if (isBoardPage.value) {
            return document.querySelector('li.board-card.is-active')
                ?.getAttribute('data-item-path')
                ?.split('#')?.[0] || '';
        }

        return '';
    });

    function updateIssueLabel(label: string) {
        if (!selectedIid.value || !selectedProjectPath.value) {
            return;
        }

        useFetch(`/api/v4/projects/${encodeURIComponent(selectedProjectPath.value)}/issues/${selectedIid.value}`, {
            headers: { 'X-CSRF-TOKEN': csrfToken },
        })
            .put({ add_labels: [label] })
            .then(async () => {
                const scopePrefix = label.split('::')[0];
                delete teleportElements.value[scopePrefix];
            });
    }

    function onClickLabelHandler(event: Event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        const target = event.target as HTMLElement;

        document.querySelectorAll('div.labels-select-wrapper span.gl-label, section.js-labels.work-item-attributes-item span.gl-label')
            .forEach((element) => {
                const spanElement = element as HTMLSpanElement;
                spanElement.style.zIndex = 'initial';
            });

        const parentElement = target?.parentElement?.parentElement as HTMLSpanElement || null;

        const scope = (parentElement?.getAttribute('data-qa-label-name') || parentElement?.getAttribute('data-testid'))
            ?.split('::')?.[0] || '';

        if (parentElement) {
            parentElement.style.zIndex = '1';
        }
        selectedScope.value = selectedScope.value === scope ? '' : scope;
        offsetLeft.value = 0 - (parentElement?.offsetLeft || 0) + 'px';
    }

    async function onClickDocumentHandler() {
        await fetchMultipleProjectLabels();

        setTimeout(() => {
            if (document.querySelector('#js-right-sidebar-portal .gl-drawer-header')) {
                deboundedInjectTeleports();
            }
        }, 400);
    }

    function injectTeleports() {
        if (!selectedIid.value || !document.querySelector('div.labels-select-wrapper .shortcut-sidebar-dropdown-toggle, section.js-labels.work-item-attributes-item .shortcut-sidebar-dropdown-toggle')) {
            return;
        }

        const labelsWrapperElement = document.querySelector('div.labels-select-wrapper, section.js-labels.work-item-attributes-item');
        if (!labelsWrapperElement) {
            return;
        }

        const labelElements = labelsWrapperElement.querySelectorAll(`span.gl-label[data-qa-label-name*="::"], span.gl-label-scoped[data-testid*="::"]`);

        labelElements.forEach((element) => {
            const scopePrefix = element.getAttribute('data-qa-label-name')
                ?.split('::')[0] || element.getAttribute('data-testid')
                ?.split('::')[0];

            if (!scopePrefix) {
                return;
            }

            element.classList.add('gl-overflow-visible');

            const scopeSpanElement = element.querySelector('span.gl-label-text');
            scopeSpanElement?.setAttribute('style', 'border-radius: 16px 0 0 16px;');

            const teleportElement = element.querySelector('span.gl-label-text-scoped');
            if (teleportElement && !teleportElements.value[scopePrefix]) {
                teleportElements.value[scopePrefix] = teleportElement as HTMLElement;
                teleportElement.addEventListener('click', onClickLabelHandler);
            }
        });
    }

    async function fetchMultipleProjectLabels() {
        const paths = extractProjectPaths();
        const promises = paths.map((path) => getProjectLabels(path));

        await Promise.all(promises);
    }

    const deboundedInjectTeleports = debounce(injectTeleports, 400);
    onMounted(async () => {
        if (!currentProjectPath) {
            setTimeout(() => {
                fetchMultipleProjectLabels();
            }, 600);
        } else {
            await getProjectLabels(currentProjectPath);
        }

        if (isBoardPage.value) {
            document.body.addEventListener('mouseup', onClickDocumentHandler);
        } else {
            on(MittEventKey.BROWSER_REQUEST_COMPLETED, deboundedInjectTeleports);
        }
    });

    onBeforeUnmount(() => {
        off(MittEventKey.BROWSER_REQUEST_COMPLETED, deboundedInjectTeleports);

        document.body.removeEventListener('mouseup', onClickDocumentHandler);

        Object.values(teleportElements.value)
            .forEach((element) => {
                element.removeEventListener('click', onClickLabelHandler);
            });
    });
</script>

<style
    lang="scss"
    scoped
>
    li.gl-dropdown-item:hover {
        cursor: pointer;
        background-color: #ececef;
    }
</style>
