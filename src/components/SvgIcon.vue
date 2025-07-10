<template>
    <svg
        v-if="path"
        class="gl-icon s16"
        style="fill: currentColor;"
        :viewBox="isGitlab ? '0 0 16 16' : '0 0 24 24'"
    >
        <path
            :d="path"
            fill-rule="evenodd"
        />
    </svg>
</template>

<script
    lang="ts"
    setup
>
    import { toRefs } from 'vue';

    interface Props {
        path: string,
        isGitlab?: boolean,
    }

    const props = withDefaults(defineProps<Props>(), {
        path: '',
        isGitlab: false,
    });

    const {
        path,
        isGitlab,
    } = toRefs(props);
</script>
