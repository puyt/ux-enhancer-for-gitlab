export function useExtractProjectPaths() {
    function extractViaTodosPage() {
        const paths: string[] = [];

        let aElements = document.querySelectorAll('ul.todos-list a.todo-target-link');
        if (aElements.length === 0) {
            aElements = document.querySelectorAll('ol[data-testid="todo-item-list"] li > a.gl-link');
        }

        aElements.forEach((aElement) => {
            const parts = (aElement.getAttribute('href') || '').replace(window.location.origin, '')
                .substring(1)
                .split('/-/');
            const projectPath = parts[0] || '';
            if (!projectPath || paths.includes(projectPath)) {
                return;
            }

            paths.push(projectPath);
        });

        return paths;
    }

    function extractViaIssuesPage() {
        const paths: string[] = [];

        const liElements = document.querySelectorAll('ul.issues-list li.issue .issuable-info .issuable-reference');
        liElements.forEach((liElement) => {
            const projectPath = liElement?.textContent?.split('#')?.[0].trim() || '';
            if (!projectPath || paths.includes(projectPath)) {
                return;
            }

            paths.push(projectPath);
        });

        return paths;
    }

    function extractViaIssueBoardPage() {
        const paths: string[] = [];

        const cardElements = document.querySelectorAll('div.boards-app ul.board-list li.board-card');
        cardElements.forEach((cardElement) => {
            const parts = (cardElement.getAttribute('data-item-path') || '').split('#');
            const projectPath = parts[0] || '';
            if (!projectPath || paths.includes(projectPath)) {
                return;
            }

            paths.push(projectPath);
        });

        return paths;
    }

    function extractViaMergeRequestsPage() {
        const paths: string[] = [];

        const aElements = document.querySelectorAll('.issuable-list .merge-request-title a, .issuable-list .issue-title a');
        aElements.forEach((aElement) => {
            const parts = (aElement.getAttribute('href') || '').split('/-/');
            const projectPath = parts[0]?.substring(1) || '';
            if (!projectPath || paths.includes(projectPath)) {
                return;
            }

            paths.push(projectPath);
        });

        return paths;
    }

    function extract() {
        if (window.location.href.includes('todos')) {
            return extractViaTodosPage();
        }

        if (window.location.href.includes('issues')) {
            return extractViaIssuesPage();
        }

        if (window.location.href.includes('boards')) {
            return extractViaIssueBoardPage();
        }

        if (window.location.href.includes('merge_requests')) {
            return extractViaMergeRequestsPage();
        }

        return [];
    }

    return {
        extract,
    };
}
