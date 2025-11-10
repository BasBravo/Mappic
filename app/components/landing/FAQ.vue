<script setup>
// IMPORTS //////////////////////

import { ref } from 'vue';

// COMPOSABLES //////////////////////

const { t } = useI18n();

// DATA //////////////////////

const faqs = [
    {
        question: 'landing.faq.q1.question',
        answer: 'landing.faq.q1.answer'
    },
    {
        question: 'landing.faq.q2.question',
        answer: 'landing.faq.q2.answer'
    },
    {
        question: 'landing.faq.q3.question',
        answer: 'landing.faq.q3.answer'
    },
    {
        question: 'landing.faq.q4.question',
        answer: 'landing.faq.q4.answer'
    },
    {
        question: 'landing.faq.q5.question',
        answer: 'landing.faq.q5.answer'
    },
    {
        question: 'landing.faq.q6.question',
        answer: 'landing.faq.q6.answer'
    }
];

// OPENS //////////////////////

const openItems = ref(new Set([0]));

// FUNCTIONS //////////////////////

function toggleItem(index) {
    if (openItems.value.has(index)) {
        openItems.value.delete(index);
    } else {
        openItems.value.add(index);
    }
}
</script>

<template>
    <section class="w-full py-20 px-4 md:px-8 lg:px-20 bg-white">
        <div class="max-w-3xl mx-auto">
            <!-- Section Title -->
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold text-black mb-4">
                    {{ t('landing.faq.title') }}
                </h2>
                <p class="text-lg text-gray-600">
                    {{ t('landing.faq.subtitle') }}
                </p>
            </div>

            <!-- FAQ Items -->
            <div class="space-y-4">
                <div v-for="(faq, index) in faqs" :key="index" class="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
                    <!-- Question Button -->
                    <button
                        @click="toggleItem(index)"
                        class="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                    >
                        <h3 class="text-left font-semibold text-black">
                            {{ t(faq.question) }}
                        </h3>
                        <i :class="[
                            'i-tabler-chevron-down transition-transform',
                            openItems.has(index) ? 'rotate-180' : ''
                        ]" />
                    </button>

                    <!-- Answer -->
                    <transition
                        enter-active-class="transition-all duration-300"
                        leave-active-class="transition-all duration-300"
                        enter-from-class="max-h-0 opacity-0"
                        enter-to-class="max-h-96 opacity-100"
                        leave-from-class="max-h-96 opacity-100"
                        leave-to-class="max-h-0 opacity-0"
                    >
                        <div v-if="openItems.has(index)" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <p class="text-gray-600 leading-relaxed">
                                {{ t(faq.answer) }}
                            </p>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
