<template>
    <div class="setting-text-input">
        <label
            v-if="label"
            :title="title"
        >
            {{ label }}:
        </label>

        <div>
            <input
                v-model="settingValue"
                :type="isSensitive ? 'password' : 'text'"
            />

            <button
                title="Save"
                @click="saveToStorage"
            >
                <SvgIcon
                    :is-gitlab="false"
                    :path="mdiContentSaveOutline"
                    style="fill: currentColor;"
                />
            </button>
        </div>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        onMounted,
        ref,
    } from 'vue';
    import { mdiContentSaveOutline } from '@mdi/js';
    import SvgIcon from '../components/SvgIcon.vue';

    interface Props {
        label: string,
        title?: string,
        settingKey: string
        isSensitive?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        title: '',
        isSensitive: false,
    });

    const emit = defineEmits<{
        'saved': [value: string]
    }>();

    const settingValue = ref('');

    function saveToStorage() {
        chrome.storage.local.set({ [props.settingKey]: settingValue.value });
        emit('saved', settingValue.value);
    }

    onMounted(() => {
        chrome.storage.local.get([props.settingKey], (result: any) => {
            settingValue.value = result?.[props.settingKey] || '';
        });
    });
</script>

<style scoped>
    .setting-text-input {
        flex-direction: column;
    }

    div {
        display: flex;
    }

    label {
        display: flex;
        font-size: 14px;
        line-height: 24px;
    }

    input {
        width: 100%;
        min-height: 32px;
        padding: 3px 4px;
        border-color: transparent;
        border-radius: 4px;
    }

    button {
        min-width: 32px;
        margin-left: 8px;
        color: white;
        border: 1px solid white;
        border-radius: 4px;
        outline: none;
        background-color: rgba(255, 255, 255, 0.1);
        transition: background-color 0.3s ease-in-out;
        -webkit-tap-highlight-color: transparent;

        &:hover {
            color: #7b45c8;
            cursor: pointer;
            background-color: rgba(255, 255, 255, 0.5);
        }

        &:active {
            color: #7b45c8;
            background-color: rgba(255, 255, 255, 0.7);
        }
    }
</style>
