<script setup>
// IMPORTS //////////////////////

// COMPOSABLES //////////////////////

const { t } = useI18n();

// DATA //////////////////////

const faqs = [
    {
        icon: 'i-tabler-help',
        question: 'landing.faq.q1.question',
        answer: 'landing.faq.q1.answer',
    },
    {
        icon: 'i-tabler-help',
        question: 'landing.faq.q2.question',
        answer: 'landing.faq.q2.answer',
    },
    {
        icon: 'i-tabler-help',
        question: 'landing.faq.q3.question',
        answer: 'landing.faq.q3.answer',
    },
    {
        icon: 'i-tabler-help',
        question: 'landing.faq.q4.question',
        answer: 'landing.faq.q4.answer',
    },
    {
        icon: 'i-tabler-help',
        question: 'landing.faq.q5.question',
        answer: 'landing.faq.q5.answer',
    },
    {
        icon: 'i-tabler-help',
        question: 'landing.faq.q6.question',
        answer: 'landing.faq.q6.answer',
    },
];
</script>

<template>
    <section class="w-full py-20 md:px-8 lg:px-20">
        <div class="max-w-6xl mx-auto">
            <!-- Section Title -->
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-6xl font-bold text-black mb-4">
                    {{ t('landing.faq.title') }}
                </h2>
                <p class="text-xl text-black max-w-2xl mx-auto">
                    {{ t('landing.faq.subtitle') }}
                </p>
            </div>

            <!-- FAQ Items Grid -->
            <div class="grid grid-cols-1 max-w-2xl mx-auto gap-4">
                <div v-for="(faq, index) in faqs" :key="index">
                    <UCollapsible :default-open="index === 0" class="flex flex-col gap-0 p-2 bg-white border border-black/10 rounded-2xl">
                        <!-- Question Trigger -->
                        <template #default="{ open }">
                            <div class="flex items-start gap-4 p-4 transition-colors cursor-pointer">
                                <!-- Question and Chevron -->
                                <div class="flex-1 flex items-start justify-between gap-4">
                                    <h3 class="text-lg font-semibold text-black text-left">
                                        {{ t(faq.question) }}
                                    </h3>
                                    <UIcon v-if="!open" name="i-tabler-plus" class="text-2xl" />
                                    <UIcon v-else name="i-tabler-minus" class="text-2xl" />
                                </div>
                            </div>
                        </template>

                        <!-- Answer Content -->
                        <template #content>
                            <div class="p-4 pt-0 pb-6">
                                <p class="text-black text-lg leading-relaxed">
                                    {{ t(faq.answer) }}
                                </p>
                            </div>
                        </template>
                    </UCollapsible>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
