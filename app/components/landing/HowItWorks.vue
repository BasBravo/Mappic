<script setup>
// IMPORTS //////////////////////

// COMPOSABLES //////////////////////

const { t } = useI18n();

// DATA //////////////////////

const steps = [
    {
        number: '1',
        icon: 'i-tabler-map-search',
        title: 'landing.howitworks.step1.title',
        description: 'landing.howitworks.step1.description'
    },
    {
        number: '2',
        icon: 'i-tabler-palette-2',
        title: 'landing.howitworks.step2.title',
        description: 'landing.howitworks.step2.description'
    },
    {
        number: '3',
        icon: 'i-tabler-wand-2',
        title: 'landing.howitworks.step3.title',
        description: 'landing.howitworks.step3.description'
    },
    {
        number: '4',
        icon: 'i-tabler-download',
        title: 'landing.howitworks.step4.title',
        description: 'landing.howitworks.step4.description'
    }
];
</script>

<template>
    <section class="w-full py-20 px-4 md:px-8 lg:px-20 bg-gray-50">
        <div class="max-w-6xl mx-auto">
            <!-- Section Title -->
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold text-black mb-4">
                    {{ t('landing.howitworks.title') }}
                </h2>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                    {{ t('landing.howitworks.subtitle') }}
                </p>
            </div>

            <!-- Steps -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div v-for="(step, index) in steps" :key="index" class="relative">
                    <!-- Step Card -->
                    <div class="flex flex-col items-center text-center">
                        <!-- Step Number Badge -->
                        <div class="mb-4 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                            {{ step.number }}
                        </div>

                        <!-- Icon -->
                        <div class="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                            <i :class="[step.icon, 'text-3xl text-blue-600']" />
                        </div>

                        <!-- Title -->
                        <h3 class="text-lg font-semibold text-black mb-2">
                            {{ t(step.title) }}
                        </h3>

                        <!-- Description -->
                        <p class="text-gray-600 text-sm leading-relaxed">
                            {{ t(step.description) }}
                        </p>
                    </div>

                    <!-- Connector Line (hidden on last item) -->
                    <div v-if="index < steps.length - 1" class="hidden lg:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 bg-gradient-to-r from-blue-200 to-transparent" />
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
