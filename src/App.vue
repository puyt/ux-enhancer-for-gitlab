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
    import {
        computed,
        onMounted,
        ref,
    } from 'vue';
    import CommandPanelEnhancer from './components/CommandPanelEnhancer.vue';
    import IssueDetail from './components/IssueDetail.vue';
    import MyUnresolvedThreads from './components/MyUnresolvedThreads.vue';
    import MergeRequestDetail from './components/MergeRequestDetail.vue';
    import Preferences from './components/Preferences.vue';
    import ScopedLabelsDropdowns from './components/ScopedLabelsDropdowns.vue';
    import TodoList from './components/TodoList.vue';
    import { useRenderProjectAvatarIssues } from './composables/useRenderProjectAvatarIssues';
    import { useRenameProjectInIssueBoards } from './composables/useRenameProjectInIssueBoards';
    import { useHighlightMyIssuesMrs } from './composables/useHighlightMyIssuesMrs';
    import { useDimDraftMrs } from './composables/useDimDraftMrs';
    import { useExtensionStore } from './store';
    import { usePersistentFilters } from './composables/usePersistentFilters';
    import StarIssueBoards from './components/StarIssueBoards.vue';
    import { useHighlightMyApprovals } from './composables/useHighlightMyApprovals';
    import { Preference } from './enums';
    import { useMitt } from './composables/useMitt';
    import { storeToRefs } from 'pinia';

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

    const isScopedLabelsDropdownEnabled = computed(() => getSetting(Preference.GENERAL_SCOPED_LABELS_DROPDOWN, true) && csrfToken && (isIssueBoardPage.value || (IID.value && (isMergeRequestPage.value || isIssuePage.value))));
    const isStarIssueBoardsEnabled = computed(() => getSetting(Preference.ISSUE_STAR_BOARDS, true) && isIssueBoardPage.value);

    onMounted(async () => {
        const csrfTokenMetaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
        csrfToken.value = csrfTokenMetaTag.content || '';

        window.addEventListener('message', (event) => {
            if (event.data.type === 'browser-request-completed' && !event.data.data.url.includes('is_custom=1')) {
                if (event.data.data.url.includes('/api/graphql')) {
                    emit('graphql-request-completed', event.data.data);
                }

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
