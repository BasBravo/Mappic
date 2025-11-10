<script setup>
const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
});

const emit = defineEmits(['update:open', 'close']);

// Computed property to control modal visibility
const isOpen = computed({
    get: () => props.open,
    set: value => emit('update:open', value),
});
</script>

<template>
    <UModal v-model:open="isOpen">
        <template #content>
            <UButton class="absolute top-4 right-4" variant="ghost" size="xl" @click="isOpen = false" icon="i-tabler-x" />

            <div v-if="title" class="mb-6 p-4 text-center">
                <span class="text-lg font-semibold">{{ title }}</span>
            </div>
            <div class="p-8 pt-4">
                <slot></slot>
            </div>
        </template>
    </UModal>
</template>
