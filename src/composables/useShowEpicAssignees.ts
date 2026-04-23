import { debounce } from 'lodash-es';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import {
    fetchEpicAssignees,
    type IEpicAssignee,
} from '../apis/epic';
import { Preference } from '../enums';
import { useExtensionStore } from '../store';
import { usePageDetectionStore } from '../stores';

const INJECTED_CLASS = 'glab-enhancer-browser-extension__epic-assignees';

const cache = new Map<string, IEpicAssignee[]>();
const inflight = new Map<string, Promise<IEpicAssignee[]>>();

interface ParsedEpic {
    fullPath: string;
    iid: number;
}

function parseEpicLink(href: string): ParsedEpic | null {
    const match = /\/groups\/(.+?)\/-\/epics\/(\d+)/.exec(href);
    if (!match) {
        return null;
    }

    const iid = parseInt(match[2], 10);
    if (!iid) {
        return null;
    }

    return {
        fullPath: match[1],
        iid,
    };
}

function buildAssigneesElement(assignees: IEpicAssignee[]): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = `board-card-assignee gl-flex gl-relative gl-justify-end ${INJECTED_CLASS}`;
    wrapper.style.zIndex = '1';

    assignees.forEach((assignee) => {
        const link = document.createElement('a');
        link.setAttribute('href', assignee.webUrl);
        link.setAttribute('data-username', assignee.username);
        link.setAttribute('draggable', 'false');
        link.setAttribute('title', `Assigned to ${assignee.name}`);
        link.className = 'gl-avatar-link user-avatar-link js-no-trigger gl-link gl-link-meta has-tooltip';

        const span = document.createElement('span');

        if (assignee.avatarUrl) {
            const img = document.createElement('img');
            img.setAttribute('src', assignee.avatarUrl);
            img.setAttribute('alt', `Avatar for ${assignee.name}`);
            img.setAttribute('draggable', 'false');
            img.setAttribute('data-testid', 'user-avatar-image');
            img.className = 'gl-bg-cover gl-avatar gl-avatar-circle gl-avatar-s16 gl-lg-avatar-s24';
            span.appendChild(img);
        } else {
            const identicon = document.createElement('div');
            identicon.className = 'gl-avatar gl-avatar-identicon gl-avatar-circle gl-avatar-s16 gl-lg-avatar-s24 gl-avatar-identicon-bg6';
            identicon.textContent = assignee.name.charAt(0).toUpperCase();
            span.appendChild(identicon);
        }

        link.appendChild(span);
        wrapper.appendChild(link);
    });

    return wrapper;
}

function findInjectionTarget(card: HTMLElement): HTMLElement | null {
    return card.querySelector('.board-card-footer') as HTMLElement | null
        || card.querySelector('[data-testid="board-card-footer"]') as HTMLElement | null
        || card.querySelector('.board-card-information') as HTMLElement | null
        || card.querySelector('.board-card-body') as HTMLElement | null
        || card.querySelector(':scope > div > div.gl-flex.gl-flex-col') as HTMLElement | null
        || card;
}

function injectAssignees(card: HTMLElement, assignees: IEpicAssignee[]) {
    const existing = card.querySelector(`.${INJECTED_CLASS}`);
    if (existing) {
        existing.remove();
    }

    if (assignees.length === 0) {
        return;
    }

    const target = findInjectionTarget(card);
    if (!target) {
        return;
    }

    target.appendChild(buildAssigneesElement(assignees));
}

export function useShowEpicAssignees() {
    const { getSetting } = useExtensionStore();
    const { isEpicBoardPage } = storeToRefs(usePageDetectionStore());

    const isEnabled = computed(() => !!getSetting(Preference.EPIC_BOARDS_SHOW_ASSIGNEES, true));

    function render() {
        if (!isEnabled.value || !isEpicBoardPage.value) {
            return;
        }

        const cards = document.querySelectorAll('li.board-card');
        cards.forEach((cardNode) => {
            const card = cardNode as HTMLElement;

            const link = card.querySelector('a[href*="/-/epics/"]') as HTMLAnchorElement | null;
            if (!link) {
                return;
            }

            const parsed = parseEpicLink(link.getAttribute('href') || '');
            if (!parsed) {
                return;
            }

            const cacheKey = `${parsed.fullPath}#${parsed.iid}`;

            if (cache.has(cacheKey)) {
                injectAssignees(card, cache.get(cacheKey)!);
                return;
            }

            if (inflight.has(cacheKey)) {
                inflight.get(cacheKey)!.then(assignees => injectAssignees(card, assignees));
                return;
            }

            const promise = fetchEpicAssignees(parsed.fullPath, parsed.iid)
                .then((assignees) => {
                    cache.set(cacheKey, assignees);
                    inflight.delete(cacheKey);
                    return assignees;
                })
                .catch(() => {
                    inflight.delete(cacheKey);
                    return [] as IEpicAssignee[];
                });

            inflight.set(cacheKey, promise);
            promise.then(assignees => injectAssignees(card, assignees));
        });
    }

    return {
        render: debounce(render, 500),
    };
}
