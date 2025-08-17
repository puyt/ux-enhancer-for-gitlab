<template>
    <span
        :class="{
            'gl-label-scoped': label.includes('::'),
            'gl-label-sm': isSmall,
        }"
        class="gl-label gl-mr-2 gl-label-text-light"
        :style="{
            '--label-background-color': color,
            '--label-inset-border': `inset 0 0 0 1px ${color}`,
        }"
    >
        <span
            class="gl-label-text"
            :style="{
                color: textColor,
            }"
        >
            {{ label.split('::')[0] }}
        </span>

        <span
            v-if="label.includes('::')"
            class="gl-label-text-scoped"
        >
            {{ label.split('::')[1] }}
        </span>
    </span>
</template>

<script
    lang="ts"
    setup
>
    interface Props {
        label: string,
        color: string,
        textColor: string,
        isSmall?: boolean,
    }

    const { isSmall = true } = defineProps<Props>();
</script>
