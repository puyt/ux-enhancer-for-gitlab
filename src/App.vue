<template>
    <div v-if="isReady">
        <Preferences />

        <CommandPanelEnhancer />

        <IssueDetail
            v-if="isIssuePage && IID"
            :current-project-path="projectPath"
            :iid="IID"
        />

        <MyUnresolvedThreads
            v-if="isMrIssueOverviewReady && !IID"
            :current-project-path="projectPath"
            :is-merge-request="isMergeRequestPage"
        />

        <MergeRequestDetail
            v-if="isMergeRequestPage && IID"

            :csrf-token="csrfToken"
            :current-project-path="projectPath"
            :iid="IID"
        />

        <TodoList v-if="isTodoListPage" />

        <ScopedLabelsDropdowns
            v-if="isScopedLabelsDropdownEnabled"
            :csrf-token="csrfToken"
            :current-project-path="!isGroupPage ? projectPath : ''"
            :iid="IID"
        />

        <StarIssueBoards v-if="isStarIssueBoardsEnabled" />
    </div>
</template>

<script
    lang="ts"
    setup
>
    import { useBrowserLocation } from '@vueuse/core';
    import { storeToRefs } from 'pinia';
    import {
        computed,
        onMounted,
        ref,
    } from 'vue';
    import CommandPanelEnhancer from './components/CommandPanelEnhancer.vue';
    import IssueDetail from './components/IssueDetail.vue';
    import MergeRequestDetail from './components/MergeRequestDetail.vue';
    import MyUnresolvedThreads from './components/MyUnresolvedThreads.vue';
    import Preferences from './components/Preferences.vue';
    import ScopedLabelsDropdowns from './components/ScopedLabelsDropdowns.vue';
    import StarIssueBoards from './components/StarIssueBoards.vue';
    import TodoList from './components/TodoList.vue';
    import { useDimDraftMrs } from './composables/useDimDraftMrs';
    import { useHighlightMyApprovals } from './composables/useHighlightMyApprovals';
    import { useHighlightMyIssuesMrs } from './composables/useHighlightMyIssuesMrs';
    import { useMitt } from './composables/useMitt';
    import { usePersistentFilters } from './composables/usePersistentFilters';
    import { useRenameProjectInIssueBoards } from './composables/useRenameProjectInIssueBoards';
    import { useRenderProjectAvatarIssues } from './composables/useRenderProjectAvatarIssues';
    import {
        BrowserMessageType,
        MittEventKey,
        Preference,
    } from './enums';
    import { useExtensionStore } from './store';

    const { emit } = useMitt();

    const {
        gitlabUserId,
        gitlabUsername,
        isReady,
    } = storeToRefs(useExtensionStore());

    const { getSetting } = useExtensionStore();

    usePersistentFilters();
    const { render: renderProjectAvatars } = useRenderProjectAvatarIssues();
    const { rename: renameProjectIssueBoards } = useRenameProjectInIssueBoards();
    const { highlight: highlightMyIssuesMrs } = useHighlightMyIssuesMrs();
    const { dim: dimDraftMrs } = useDimDraftMrs();

    const csrfToken = ref('');
    const isMrIssueOverviewReady = ref(false);

    const location = useBrowserLocation();

    const isGroupPage = computed(() => !!location.value.pathname?.includes('groups'));
    const isMergeRequestPage = computed(() => !!location.value.pathname?.includes('merge_requests'));
    const isIssuePage = computed(() => !!location.value.pathname?.includes('issues'));
    const isIssueBoardPage = computed(() => !!location.value.pathname?.includes('boards'));
    const isIssuesListPage = computed(() => {
        const { pathname } = location.value;
        return !!pathname?.includes('/-/issues') && !pathname?.match(/\/-\/(?:issues|work_items)\/\d+/);
    });
    const isTodoListPage = computed(() => !!location.value.pathname?.includes('dashboard/todos'));

    const projectPath = computed(() => {
        return location.value?.pathname?.split('/-/')?.[0].slice(1) || '';
    });
    const IID = computed(() => {
        if (!location.value?.pathname || isIssueBoardPage.value) {
            return 0;
        }

        const regexPattern = /\/(\d+)\/?.*$/;
        const match = regexPattern.exec(location.value.pathname);
        return match?.length === 2 ? parseInt(match[1], 10) : 0;
    });

    const isScopedLabelsDropdownEnabled = computed(() => getSetting(Preference.GENERAL_SCOPED_LABELS_DROPDOWN, true)
        && csrfToken
        && (isIssueBoardPage.value
            || isIssuesListPage.value
            || (IID.value && (isMergeRequestPage.value || isIssuePage.value))));
    const isStarIssueBoardsEnabled = computed(() => getSetting(Preference.ISSUE_STAR_BOARDS, true) && isIssueBoardPage.value);

    onMounted(async () => {
        const csrfTokenMetaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
        csrfToken.value = csrfTokenMetaTag.content || '';

        window.addEventListener('message', (event) => {
            if (event.data.type === BrowserMessageType.BROWSER_REQUEST_COMPLETED && !event.data.data.url.includes('is_custom=1')) {
                if (event.data.data.url.includes('/api/graphql')) {
                    emit(MittEventKey.GRAPHQL_REQUEST_COMPLETED, event.data.data);
                }

                emit(MittEventKey.BROWSER_REQUEST_COMPLETED, event.data.data);

                renderProjectAvatars();
                renameProjectIssueBoards();
                highlightMyIssuesMrs(gitlabUsername.value);
                dimDraftMrs();

                useHighlightMyApprovals(gitlabUserId.value);

                isMrIssueOverviewReady.value = !!document.querySelector('ul.issuable-list > li:first-child .issuable-reference');
            }
        });
    });
</script>
