import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';

type SettingValue = boolean | string | number | null;


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
