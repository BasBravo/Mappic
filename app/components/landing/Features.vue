<script setup>
// IMPORTS //////////////////////

// COMPOSABLES //////////////////////

const { t } = useI18n();

// DATA //////////////////////

const features = [
    {
        icon: 'i-tabler-palette',
        title: 'landing.features.customizable.title',
        description: 'landing.features.customizable.description'
    },
    {
        icon: 'i-tabler-photo',
        title: 'landing.features.resolution.title',
        description: 'landing.features.resolution.description'
    },
    {
        icon: 'i-tabler-click',
        title: 'landing.features.easy.title',
        description: 'landing.features.easy.description'
    },
    {
        icon: 'i-tabler-printer',
        title: 'landing.features.print.title',
        description: 'landing.features.print.description'
    }
];
</script>

<template>
    <section class="w-full py-20 px-4 md:px-8 lg:px-20 bg-white">
        <div class="max-w-6xl mx-auto">
            <!-- Section Title -->
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold text-black mb-4">
                    {{ t('landing.features.title') }}
                </h2>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                    {{ t('landing.features.subtitle') }}
                </p>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div v-for="(feature, index) in features" :key="index" class="flex flex-col items-start">
                    <!-- Icon -->
                    <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                        <i :class="[feature.icon, 'text-2xl text-blue-600']" />
                    </div>
                    
                    <!-- Title -->
                    <h3 class="text-xl font-semibold text-black mb-2">
                        {{ t(feature.title) }}
                    </h3>
                    
                    <!-- Description -->
                    <p class="text-gray-600 text-sm leading-relaxed">
                        {{ t(feature.description) }}
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
