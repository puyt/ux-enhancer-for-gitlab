import { useBrowserLocation } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, watchEffect } from 'vue';
import { PageType } from '../enums';
import { APP_NAMESPACE } from '../constants';

export const usePageDetectionStore = defineStore(`${APP_NAMESPACE}/pageDetection`, () => {
    const location = useBrowserLocation();

    const pathname = computed<string>((oldValue) => {
        const newValue = location.value.pathname || '';
        return oldValue === newValue ? oldValue : newValue;
    });

    const search = computed<string>((oldValue) => {
        const newValue = location.value.search || '';
        return oldValue === newValue ? oldValue : newValue;
    });

    const href = computed<string>((oldValue) => {
        const newValue = location.value.href || '';
        return oldValue === newValue ? oldValue : newValue;
    });

    const projectPath = computed<string | undefined>((oldValue) => {
        const path = pathname.value.split('/-/')?.[0]?.slice(1) || '';
        const newValue = path || undefined;
        return oldValue === newValue ? oldValue : newValue;
    });

    const iid = computed<number | undefined>((oldValue) => {
        const path = pathname.value;
        if (!path) {
            return oldValue === undefined ? oldValue : undefined;
        }

        const regexPattern = /\/(\d+)\/?.*$/;
        const match = regexPattern.exec(path);
        const newValue = match?.length === 2 ? parseInt(match[1], 10) : undefined;

        return oldValue === newValue ? oldValue : newValue;
    });

    const pageType = computed<PageType>(() => {
        const path = pathname.value;
        const hasIid = !!iid.value;

        if (path.includes('/dashboard/issues')) {
            return PageType.DASHBOARD_ISSUES;
        } else if (path.includes('/dashboard/merge_requests')) {
            return PageType.DASHBOARD_MERGE_REQUESTS;
        } else if (path.includes('/dashboard/todos')) {
            return PageType.DASHBOARD_TODOS;
        } else if (path.includes('/groups/') && path.includes('/issues')) {
            return PageType.GROUP_ISSUES;
        } else if (path.includes('/groups/') && path.includes('/merge_requests')) {
            return PageType.GROUP_MERGE_REQUESTS;
        } else if (path.includes('/groups/') && path.includes('/boards')) {
            return PageType.GROUP_BOARDS;
        } else if (path.includes('/-/issues') && hasIid) {
            return PageType.PROJECT_ISSUE_DETAIL;
        } else if (path.includes('/-/issues')) {
            return PageType.PROJECT_ISSUES;
        } else if (path.includes('/-/merge_requests') && hasIid) {
            return PageType.PROJECT_MERGE_REQUEST_DETAIL;
        } else if (path.includes('/-/merge_requests')) {
            return PageType.PROJECT_MERGE_REQUESTS;
        } else if (path.includes('/-/boards')) {
            return PageType.PROJECT_BOARDS;
        } else if (path.includes('/-/pipelines')) {
            return PageType.PROJECT_PIPELINES;
        } else {
            return PageType.UNKNOWN;
        }
    });

    // Category flags
    const isDashboard = computed<boolean>(() => {
        const type = pageType.value;
        return type === PageType.DASHBOARD_ISSUES ||
            type === PageType.DASHBOARD_MERGE_REQUESTS ||
            type === PageType.DASHBOARD_TODOS;
    });

    const isProject = computed<boolean>(() => {
        const type = pageType.value;
        return type === PageType.PROJECT_ISSUES ||
            type === PageType.PROJECT_ISSUE_DETAIL ||
            type === PageType.PROJECT_MERGE_REQUESTS ||
            type === PageType.PROJECT_MERGE_REQUEST_DETAIL ||
            type === PageType.PROJECT_BOARDS ||
            type === PageType.PROJECT_PIPELINES;
    });

    const isGroup = computed<boolean>(() => {
        const type = pageType.value;
        return type === PageType.GROUP_ISSUES ||
            type === PageType.GROUP_MERGE_REQUESTS ||
            type === PageType.GROUP_BOARDS;
    });

    const isDetail = computed<boolean>(() => {
        const type = pageType.value;
        return type === PageType.PROJECT_ISSUE_DETAIL ||
            type === PageType.PROJECT_MERGE_REQUEST_DETAIL;
    });

    // Specific page types
    const isIssuePage = computed(() => {
        const type = pageType.value;
        return type === PageType.PROJECT_ISSUES ||
            type === PageType.PROJECT_ISSUE_DETAIL ||
            type === PageType.DASHBOARD_ISSUES ||
            type === PageType.GROUP_ISSUES;
    });

    const isMergeRequestPage = computed<boolean>(() => {
        const type = pageType.value;
        return type === PageType.PROJECT_MERGE_REQUESTS ||
            type === PageType.PROJECT_MERGE_REQUEST_DETAIL ||
            type === PageType.DASHBOARD_MERGE_REQUESTS ||
            type === PageType.GROUP_MERGE_REQUESTS;
    });

    const isBoardPage = computed<boolean>(() => {
        const type = pageType.value;
        return type === PageType.PROJECT_BOARDS ||
            type === PageType.GROUP_BOARDS;
    });

    const isTodoPage = computed<boolean>(() => {
        return pageType.value === PageType.DASHBOARD_TODOS;
    });

    // Alias properties for convenience
    const isGroupPage = computed<boolean>(() => {
        return isGroup.value;
    });

    const isProjectPage = computed<boolean>(() => {
        return isProject.value;
    });

    const isDetailPage = computed<boolean>(() => {
        return isDetail.value;
    });

    return {
        // Basic location data
        pathname,
        search,
        href,

        // Extracted data
        projectPath,
        iid,
        pageType,

        // Category flags
        isDashboard,
        isProject,
        isGroup,
        isDetail,

        // Specific page types
        isIssuePage,
        isMergeRequestPage,
        isBoardPage,
        isTodoPage,
        isGroupPage,
        isProjectPage,
        isDetailPage,
    };
});
