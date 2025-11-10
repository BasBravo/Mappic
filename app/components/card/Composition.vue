<script setup>
defineProps({
    imageSrc: { type: String, required: false },
    title: { type: String, required: true },
    description: { type: String, required: false },
});
</script>

<template>
    <div class="flex flex-col w-sm p-6 items-center justify-center">
        <img v-if="imageSrc" :src="imageSrc" class="h-48 w-auto my-4" />
        <h2 class="mt-4 text-2xl font-semibold text-gray-900">{{ title }}</h2>
        <p v-if="description" class="mt-2 text-gray-600 text-center text-balance">{{ description }}</p>
        <div class="mt-8 w-full flex items-center justify-center">
            <slot />
        </div>
    </div>
</template>
