<template>
    <div>
        <div v-if="isShowMyUnresolvedEnabled">
            <template
                v-for="teleportId in teleportIds"
                :key="teleportId"
            >
                <teleport
                    v-if="teleportElements[teleportId]"
                    :to="`#${teleportId}`"
                >
                    <li
                        v-if="isShowMyUnresolvedWithResponsesEnabled && myUnresolvedThreadsWithResponseCount.get(teleportId)"
                        class="has-tooltip gl-display-none gl-sm-display-block md badge badge-pill gl-badge badge-info"
                        :style="{
                            color: 'var(--gl-badge-info-text-color-default) !important',
                        }"
                        title="My unresolved threads with responses"
                    >
                        <SvgIcon
                            class="gl-icon s16 gl-mr-2"
                            :path="mdiCommentTextMultipleOutline"
                            style="fill: currentColor;"
                        />

                        <span class="gl-font-weight-bold">{{ myUnresolvedThreadsWithResponseCount.get(teleportId) || 0 }}</span>
                    </li>

                    <li
                        :class="{
                            'badge badge-pill gl-badge badge-danger':  myUnresolvedThreadsCount.get(teleportId),
                        }"
                        class="has-tooltip gl-display-none gl-sm-display-block md"
                        :style="{
                            color: 'var(--gl-badge-danger-text-color-default) !important',
                            opacity: myUnresolvedThreadsCount.get(teleportId) ? 1 : 0.5,
                        }"
                        title="My unresolved threads"
                    >
                        <SvgIcon
                            class="gl-icon s16 gl-mr-2"
                            :path="mdiCommentAccountOutline"
                            style="fill: currentColor;"
                        />

                        <span class="gl-font-weight-bold">{{ myUnresolvedThreadsCount.get(teleportId) || 0 }}</span>
                    </li>

                    <li
                        :class="{
                            'badge badge-pill gl-badge badge-warning':  unresolvedThreadsCount.get(teleportId),
                        }"
                        class="has-tooltip gl-display-none gl-sm-display-block gl-mr-3 md"
                        :style="{
                            color: 'var(--gl-badge-warning-text-color-default) !important',
                            opacity: unresolvedThreadsCount.get(teleportId) ? 1 : 0.5,
                        }"
                        title="Unresolved threads"
                    >
                        <SvgIcon
                            class="gl-icon s16 gl-mr-2"
                            :path="mdiCommentAlertOutline"
                            style="fill: currentColor;"
                        />

                        <span class="gl-font-weight-bold">{{ unresolvedThreadsCount.get(teleportId) || 0 }}</span>
                    </li>
                </teleport>
            </template>
        </div>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        computed,
        ref,
        type Ref,
        shallowRef,
        type ShallowRef,
        toRefs,
        watch,
    } from 'vue';
    import type { GitLabDiscussion } from '../types';
    import {
        mdiCommentAccountOutline,
        mdiCommentAlertOutline,
        mdiCommentTextMultipleOutline,
    } from '@mdi/js';
    import { useExtensionStore } from '../store';
    import SvgIcon from './SvgIcon.vue';
    import { useFetchPaging } from '../composables/useFetchPaging';
    import { Preference } from '../enums';

    type IID = string | Array<string>;

    interface Props {
        currentProjectPath: string,
        isMergeRequest: boolean,
    }

    const props = withDefaults(defineProps<Props>(), {
        currentProjectPath: '',
        isMergeRequest: true,
    });
    const {
        currentProjectPath,
        isMergeRequest,
    } = toRefs(props);

    const {
        gitlabUserId,
        getSetting,
    } = useExtensionStore();

    const extractIssuableIds: ShallowRef<Array<IID>> = shallowRef([]);
    const discussions: Ref<Map<string, GitLabDiscussion[]>> = ref(new Map());

    function getProjectPath(iid: IID): string {
        return Array.isArray(iid) ? iid[0] : currentProjectPath.value;
    }

    function getIid(iid: IID): string {
        return Array.isArray(iid) ? iid[1] : iid;
    }

    function getTeleportId(idd: IID): string {
        return ('teleport-issuable-meta-' + getProjectPath(idd) + '-' + getIid(idd)).replace(/\//g, '_');
    }

    const isShowMyUnresolvedWithResponsesEnabled = computed(() => (isMergeRequest.value && !!getSetting(Preference.MR_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES, true) || (!isMergeRequest.value && !!getSetting(Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES, true))));
    const isShowMyUnresolvedEnabled = computed(() => (isMergeRequest.value && !!getSetting(Preference.MR_SHOW_MY_UNRESOLVED_THREADS, true) || (!isMergeRequest.value && !!getSetting(Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS, true))));
    const teleportIds = computed(() => extractIssuableIds.value.map((iid) => getTeleportId(iid)));

    const teleportElements = computed(() => teleportIds.value.reduce((acc, teleportId) => {
        acc[teleportId] = document.getElementById(teleportId);
        return acc;
    }, {} as Record<string, HTMLElement | null>));

    const unresolvedThreadsCount = computed(() => {
        const items: Map<any, any> = new Map();

        extractIssuableIds.value.forEach((iid) => {
            const id = getIid(iid);
            const totalUnresolvedThreads = (discussions.value.get(id) || []).filter((discussion) => {
                const firstNote = discussion?.notes?.[0] || null;
                return !!firstNote?.resolvable && !firstNote?.resolved;
            });

            items.set(getTeleportId(iid), totalUnresolvedThreads.length);
        });

        return items;
    });

    const myUnresolvedThreadsCount = computed(() => {
        const items: Map<any, any> = new Map();

        extractIssuableIds.value.forEach((iid) => {
            const id = getIid(iid);
            const totalUnresolvedThreads = (discussions.value.get(id) || []).filter((discussion) => {
                const firstNote = discussion?.notes?.[0] || null;
                return !!firstNote?.resolvable && !firstNote?.resolved && firstNote?.author?.id === gitlabUserId;
            });

            items.set(getTeleportId(iid), totalUnresolvedThreads.length);
        });

        return items;
    });

    const myUnresolvedThreadsWithResponseCount = computed(() => {
        const items: Map<any, any> = new Map();

        extractIssuableIds.value.forEach((iid) => {
            const id = getIid(iid);
            const totalUnresolvedThreads = (discussions.value.get(id) || []).filter((discussion) => {
                const notes = (discussion?.notes || []).filter((note) => !note.system);

                const firstNote = notes?.[0] || null;
                const lastNote = notes?.[notes.length - 1] || null;

                const isMyThread = !!firstNote?.resolvable && !firstNote?.resolved && firstNote?.author?.id === gitlabUserId;
                const hasResponse = lastNote && !lastNote.system && lastNote.author.id !== gitlabUserId;

                return isMyThread && hasResponse;
            });

            items.set(getTeleportId(iid), totalUnresolvedThreads.length);
        });

        return items;
    });

    function fetchDiscussions() {
        extractIssuableIds.value.forEach((iid) => {
            const path = getProjectPath(iid);
            const id = getIid(iid);

            const endpoint = `/api/v4/projects/${encodeURIComponent(path)}/${isMergeRequest.value ? 'merge_requests' : 'issues'}/${id}/discussions`;
            useFetchPaging(endpoint)
                .then(({ data }) => {
                    if (data?.value) {
                        discussions.value.set(id, data?.value || [] as GitLabDiscussion[]);
                    }
                });
        });
    }

    function extractIssuableIids() {
        const values: Array<string | Array<string>> = [];
        document.querySelectorAll('.issuable-list > li .issuable-reference')
            .forEach((el) => {
                const iid = el.textContent?.trim()
                    ?.split(isMergeRequest.value ? '!' : '#') || [];

                let resolvedId: string | string[] = iid[0];
                if (iid.length === 2) {
                    resolvedId = iid[0] === '' ? iid[1] : iid;
                }
                values.push(resolvedId);

                // add teleport placeholder
                const containerElement = el.closest(isMergeRequest.value ? '.issuable-info-container' : 'li.issue');
                const metaElement = containerElement?.querySelector('li[data-testid="issuable-comments"]');

                const placeholderElement = document.createElement('div');
                placeholderElement.style.display = 'flex';
                placeholderElement.style.alignItems = 'center';
                placeholderElement.style.gap = '4px';
                placeholderElement.id = getTeleportId(resolvedId);
                metaElement?.parentElement?.insertBefore(placeholderElement, metaElement.nextSibling);
            });

        extractIssuableIds.value = values;

        fetchDiscussions();
    }

    watch(isShowMyUnresolvedEnabled, (newValue) => {
        if (newValue) {
            extractIssuableIids();
        }
    }, { immediate: true });
</script>
