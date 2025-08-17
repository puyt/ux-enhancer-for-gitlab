import { useExtensionStore } from '../store';
import {
    computed,
    onMounted,
} from 'vue';
import { storeToRefs } from 'pinia';
import { Preference } from '../enums';
import { usePageDetectionStore } from '../stores';

export function useThreadsByDefault() {
    const { getSetting } = useExtensionStore();
    const { isIssuePage, isMergeRequestPage } = storeToRefs(usePageDetectionStore());

    const isUseThreadIssueEnabled = computed(() => !!getSetting(Preference.ISSUE_USE_THREADS_BY_DEFAULT, true));
    if (isIssuePage.value && !isUseThreadIssueEnabled.value) {
        return;
    }

    const isUseThreadMrEnabled = computed(() => !!getSetting(Preference.MR_USE_THREADS_BY_DEFAULT, true));
    if (isMergeRequestPage.value && !isUseThreadMrEnabled.value) {
        return;
    }

    onMounted(() => {
        const element = document.querySelector('form.common-note-form .note-form-actions .js-comment-submit-button ul.gl-new-dropdown-contents li[data-testid="listbox-item-discussion"]') as HTMLElement;
        element?.click();
    });
}
