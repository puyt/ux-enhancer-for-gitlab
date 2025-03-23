import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';

type SettingValue = boolean | string | number | null;

export const enum Preference {
    COMMAND_PANEL_STARRED_PROJECTS = 'command_panel_starred_projects',
    COMMAND_PANEL_MOVE_PLACES = 'command_panel_move_places',

    TODO_RENDER_PROJECT_LOGOS = 'todo_render_project_logos',
    TODO_RENDER_LABELS = 'todo_render_labels',

    GENERAL_SCOPED_LABELS_DROPDOWN = 'general_scoped_labels_dropdown',
    GENERAL_PERSISTENT_FILTERS = 'general_persistent_filters',

    ISSUE_STAR_BOARDS = 'issue_star_boards',
    ISSUE_HIGHLIGHT_MINE = 'issue_highlight_mine',
    ISSUE_SHOW_MY_UNRESOLVED_THREADS = 'issue_show_my_unresolved_threads',
    ISSUE_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES = 'issue_show_my_unresolved_threads_with_responses',
    ISSUE_USE_THREADS_BY_DEFAULT = 'issue_use_threads_by_default',
    ISSUE_RENDER_PROJECT_LOGO = 'issue_render_project_logo',
    ISSUE_VALIDATE_MISSING_EPIC = 'issue_validate_missing_epic',
    ISSUE_VALIDATE_MISSING_MILESTONE = 'issue_validate_missing_milestone',
    ISSUE_VALIDATE_MISSING_ITERATION = 'issue_validate_missing_iteration',
    ISSUE_VALIDATE_MISSING_WEIGHT = 'issue_validate_missing_weight',
    ISSUE_VALIDATE_UNRESOLVED_THREADS = 'issue_validate_unresolved_threads',
    ISSUE_REQUIRED_SCOPED_LABELS = 'issue_required_scoped_labels',

    MR_HIGHLIGHT_MINE = 'mr_highlight_mine',
    MR_HIGHLIGHT_MY_APPROVALS = 'mr_highlight_my_approvals',
    MR_SHOW_ASSIGN_YOURSELF = 'mr_show_assign_yourself',
    MR_SHOW_MY_UNRESOLVED_THREADS = 'mr_show_my_unresolved_threads',
    MR_SHOW_MY_UNRESOLVED_THREADS_WITH_RESPONSES = 'mr_show_my_unresolved_threads_with_responses',
    MR_USE_THREADS_BY_DEFAULT = 'mr_use_threads_by_default',
    MR_RENDER_PROJECT_LOGO = 'mr_render_project_logo',
    MR_DIM_DRAFT = 'mr_dim_draft',
    MR_HOTKEY_VIEWED = 'mr_hotkey_viewed',
    MR_HOTKEY_VIEWED_NEXT = 'mr_hotkey_viewed_next',
}

export const useExtensionStore = defineStore('resize', () => {
        const valuesByNamespace: Ref<Map<string, SettingValue>> = useLocalStorage('glab-enhancer-browser-extension', ref(new Map()));

        function get(key: string, defaultValue: SettingValue = null): SettingValue {
            const value = valuesByNamespace.value.get(key);
            return value === undefined ? defaultValue : value;
        }

        function set(key: string, value: SettingValue) {
            valuesByNamespace.value.set(key, value);
        }

        return {
            getSetting: get,
            setSetting: set,
        };
    },
);
