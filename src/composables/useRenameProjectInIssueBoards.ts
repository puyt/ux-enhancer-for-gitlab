import { useExtractProjectPaths } from './useExtractProjectPaths';
import { useExtensionStore } from '../store';
import { debounce } from 'lodash-es';
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Preference } from '../enums';
import { usePageDetectionStore } from '../stores';

function getPathFromLevel(str: string, level: number) {
    const parts = str.split('/');
    const start = Math.max(0, parts.length - 1 - level);
    return parts.slice(start)
        .join('/');
}

export function useRenameProjectInIssueBoards() {
    const { getSetting } = useExtensionStore();
    const { extract: extractProjectPaths } = useExtractProjectPaths();
    const { isBoardPage } = storeToRefs(usePageDetectionStore());

    const projectNameParts = computed(() => getSetting(Preference.ISSUE_BOARDS_RENAME_PROJECT, 0) as number);

    function injectProjectName(projectPath: string) {
        if (!isBoardPage.value) {
            return;
        }

        let targetElements = document.querySelectorAll(`li.board-card button.board-item-path[title="${projectPath}"]`);
        if (targetElements.length === 0) {
            // Backward compatibility with old GitLab structure
            targetElements = document.querySelectorAll(`li.board-card span[title="${projectPath}"]`);
        }
        
        targetElements.forEach((targetElement) => {
            if (projectNameParts.value <= 0) {
                const parts = projectPath.split("/");
                targetElement.textContent = parts[parts.length - 1];
            } else {
                targetElement.textContent = getPathFromLevel(projectPath, projectNameParts.value);
            }
        });
    }

    function injectProjectNames() {
        const paths = extractProjectPaths();
        paths.forEach((path) => {
            injectProjectName(path);
        });
    }

    const debouncedRename = debounce(injectProjectNames, 500);

    watch(projectNameParts, () => {
        if (isBoardPage.value) {
        debouncedRename();
        }
    });


    return {
        rename: debouncedRename
    };
}