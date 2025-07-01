import { useExtractProjectPaths } from './useExtractProjectPaths';
import { useExtensionStore } from '../store';
import { debounce } from 'lodash-es';
import { computed } from 'vue';
import { Preference } from '../enums';

function getPathFromLevel(str: string, level: number) {
    const parts = str.split('/');
    const start = Math.max(0, parts.length - 1 - level);
    return parts.slice(start)
        .join('/');
}

export function useRenameProjectInIssueBoards() {
    const { getSetting } = useExtensionStore();
    const { extract: extractProjectPaths } = useExtractProjectPaths();

    const projectNameParts = computed(() => getSetting(Preference.ISSUE_BOARDS_RENAME_PROJECT, 0) as number);

    function injectProjectName(projectPath: string) {
        if (projectNameParts.value <= 0) {
            return;
        }
        if (!window.location.href.includes('boards')) {
            return;
        }

        const targetElements = document.querySelectorAll(`li.board-card span[title="${projectPath}"]`);
        targetElements.forEach((targetElement) => {
            targetElement.textContent = getPathFromLevel(projectPath, projectNameParts.value);
        });

    }

    function injectProjectNames() {
        const paths = extractProjectPaths();
        paths.forEach((path) => {
            injectProjectName(path);
        });
    }

    return {
        rename: debounce(injectProjectNames, 500),
    };
}