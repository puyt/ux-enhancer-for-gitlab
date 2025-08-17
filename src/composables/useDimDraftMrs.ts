import { useExtensionStore } from '../store';
import { debounce } from 'lodash-es';
import { storeToRefs } from 'pinia';
import { Preference } from '../enums';
import { usePageDetectionStore } from '../stores';

export function useDimDraftMrs() {
    const { getSetting } = useExtensionStore();
    const { isMergeRequestPage } = storeToRefs(usePageDetectionStore());

    function dim() {
        if (!getSetting(Preference.MR_DIM_DRAFT, true) || !isMergeRequestPage.value) {
            return;
        }

        document.querySelectorAll('li.merge-request')
            .forEach((element) => {
                if (element.textContent?.includes('Draft:')) {
                    element.classList.add('merge-request-draft');
                }
            });
    }

    return {
        dim: debounce(dim, 300),
    };
}
