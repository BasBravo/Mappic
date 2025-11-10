<script setup>
// IMPORTS //////////////////////

// COMPOSABLES //////////////////////

const { t } = useI18n();

// DATA //////////////////////

const stats = [
    {
        number: '10K+',
        label: 'landing.socialproof.maps'
    },
    {
        number: '50+',
        label: 'landing.socialproof.countries'
    },
    {
        number: '4.8★',
        label: 'landing.socialproof.rating'
    },
    {
        number: '100%',
        label: 'landing.socialproof.satisfaction'
    }
];
</script>

<template>
    <section class="w-full py-20 px-4 md:px-8 lg:px-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div class="max-w-6xl mx-auto">
            <!-- Section Title -->
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold text-black mb-4">
                    {{ t('landing.socialproof.title') }}
                </h2>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                    {{ t('landing.socialproof.subtitle') }}
                </p>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div v-for="(stat, index) in stats" :key="index" class="text-center">
                    <!-- Number -->
                    <div class="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                        {{ stat.number }}
                    </div>
                    
                    <!-- Label -->
                    <p class="text-gray-600 font-medium">
                        {{ t(stat.label) }}
                    </p>
                </div>
            </div>

            <!-- Trust Badge -->
            <div class="mt-16 text-center">
                <p class="text-gray-600 mb-4">
                    {{ t('landing.socialproof.trusted') }}
                </p>
                <div class="flex justify-center items-center gap-4 flex-wrap">
                    <span class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                        <i class="i-tabler-shield-check text-green-600" />
                        <span class="text-sm font-medium">{{ t('landing.socialproof.secure') }}</span>
                    </span>
                    <span class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                        <i class="i-tabler-lock text-blue-600" />
                        <span class="text-sm font-medium">{{ t('landing.socialproof.private') }}</span>
                    </span>
                    <span class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                        <i class="i-tabler-zap text-yellow-600" />
                        <span class="text-sm font-medium">{{ t('landing.socialproof.fast') }}</span>
                    </span>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
