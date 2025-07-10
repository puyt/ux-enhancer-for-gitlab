import { useExtensionStore } from '../store';
import {
    computed,
    onMounted,
} from 'vue';
import { Preference } from '../enums';

export function useThreadsByDefault() {
    const { getSetting } = useExtensionStore();

    const isUseThreadIssueEnabled = computed(() => !!getSetting(Preference.ISSUE_USE_THREADS_BY_DEFAULT, true));
    if (window.location.href.includes('issues') && !isUseThreadIssueEnabled.value) {
        return;
    }

    const isUseThreadMrEnabled = computed(() => !!getSetting(Preference.MR_USE_THREADS_BY_DEFAULT, true));
    if (window.location.href.includes('merge_requests') && !isUseThreadMrEnabled.value) {
        return;
    }

    onMounted(() => {
        const element = document.querySelector('form.common-note-form .note-form-actions .js-comment-submit-button ul.gl-new-dropdown-contents li[data-testid="listbox-item-discussion"]') as HTMLElement;
        element?.click();
    });
}
