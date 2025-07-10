import { useExtensionStore } from '../store';
import { debounce } from 'lodash-es';
import { Preference } from '../enums';

export function useDimDraftMrs() {
    const { getSetting } = useExtensionStore();

    function dim() {
        if (!getSetting(Preference.MR_DIM_DRAFT, true) || !window.location.href.includes('merge_requests')) {
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
