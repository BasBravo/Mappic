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
        description: 'landing.howitworks.step1.description',
    },
    {
        number: '2',
        icon: 'i-tabler-palette-2',
        title: 'landing.howitworks.step2.title',
        description: 'landing.howitworks.step2.description',
    },
    {
        number: '3',
        icon: 'i-tabler-wand-2',
        title: 'landing.howitworks.step3.title',
        description: 'landing.howitworks.step3.description',
    },
    {
        number: '4',
        icon: 'i-tabler-download',
        title: 'landing.howitworks.step4.title',
        description: 'landing.howitworks.step4.description',
    },
];
</script>

<template>
    <section class="w-full py-20 md:px-8 lg:px-20">
        <div class="max-w-6xl mx-auto">
            <!-- Steps Title -->
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-6xl font-bold text-black mb-4">
                    {{ t('landing.howitworks.title') }}
                </h2>
                <p class="text-xl text-black max-w-2xl mx-auto">
                    {{ t('landing.howitworks.subtitle') }}
                </p>
            </div>

            <!-- Steps -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="(step, index) in steps" :key="index" class="relative">
                    <!-- Step Card -->
                    <div class="flex flex-col items-center text-center text-black">
                        <!-- Step Number Badge -->
                        <div class="mb-4 w-14 h-14 flex items-center justify-center font-bold text-5xl">
                            {{ step.number }}
                        </div>

                        <div class="p-6 bg-white border border-black/10 rounded-2xl w-full min-h-44">
                            <!-- Title -->
                            <h3 class="text-xl font-semibold mb-2">
                                {{ t(step.title) }}
                            </h3>

                            <!-- Description -->
                            <p class="leading-relaxed text-balance">
                                {{ t(step.description) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
