<script setup>
// IMPORTS //////////////////////

// COMPOSABLES //////////////////////

const { t } = useI18n();

// FUNCTIONS //////////////////////

function handleStartDesigning() {
    // Scroll to search location input
    const searchInput = document.querySelector('[data-search-location]');
    if (searchInput) {
        searchInput.scrollIntoView({ behavior: 'smooth' });
        searchInput.focus();
    }
}
</script>

<template>
    <section class="w-full py-20 px-4 md:px-8 lg:px-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div class="max-w-4xl mx-auto text-center">
            <!-- Headline -->
            <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">
                {{ t('landing.cta.headline') }}
            </h2>

            <!-- Subheadline -->
            <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {{ t('landing.cta.subheadline') }}
            </p>

            <!-- CTA Button -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <UButton
                    @click="handleStartDesigning"
                    size="xl"
                    color="white"
                    class="px-8"
                    icon="i-tabler-arrow-right"
                >
                    {{ t('landing.cta.button') }}
                </UButton>

                <p class="text-blue-100 text-sm">
                    {{ t('landing.cta.subtext') }}
                </p>
            </div>

            <!-- Features List -->
            <div class="mt-12 flex flex-wrap justify-center gap-6 text-blue-100">
                <div class="flex items-center gap-2">
                    <i class="i-tabler-check text-white" />
                    <span>{{ t('landing.cta.feature1') }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <i class="i-tabler-check text-white" />
                    <span>{{ t('landing.cta.feature2') }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <i class="i-tabler-check text-white" />
                    <span>{{ t('landing.cta.feature3') }}</span>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
