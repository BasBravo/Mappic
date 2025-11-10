<script setup>
// IMPORTS //////////////////////

// COMPOSABLES //////////////////////

const { t } = useI18n();

// DATA //////////////////////

const features = [
    {
        icon: 'i-tabler-palette',
        title: 'landing.features.customizable.title',
        description: 'landing.features.customizable.description',
    },
    {
        icon: 'i-tabler-photo',
        title: 'landing.features.resolution.title',
        description: 'landing.features.resolution.description',
    },
    {
        icon: 'i-tabler-click',
        title: 'landing.features.easy.title',
        description: 'landing.features.easy.description',
    },
    {
        icon: 'i-tabler-printer',
        title: 'landing.features.print.title',
        description: 'landing.features.print.description',
    },
];
</script>

<template>
    <section class="w-full py-20 md:px-8 lg:px-20">
        <div class="max-w-6xl mx-auto">
            <!-- Section Title -->
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-6xl font-bold text-black mb-4">
                    {{ t('landing.features.title') }}
                </h2>
                <p class="text-xl text-black max-w-2xl mx-auto">
                    {{ t('landing.features.subtitle') }}
                </p>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div
                    v-for="(feature, index) in features"
                    :key="index"
                    class="flex flex-col items-start p-6 bg-white border border-black/10 rounded-2xl">
                    <!-- Icon -->
                    <div class="mb-4"><UIcon :name="feature.icon" class="text-3xl" /></div>

                    <!-- Title -->
                    <h3 class="text-xl font-semibold text-black mb-2">
                        {{ t(feature.title) }}
                    </h3>

                    <!-- Description -->
                    <p class="text-black text-lg leading-relaxed">
                        {{ t(feature.description) }}
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
