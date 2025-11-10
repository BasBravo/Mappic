<script setup>
//
// IMPORTS
//
import { useI18n } from 'vue-i18n';
import { capitalize } from '~~/app/utils';
import { aboutPages } from '~~/data/nav';

//
// VARS
//
const { t, locale } = useI18n();
const route = useRoute();

//
// INIT
//
const myPages = aboutPages.map(page => ({
    ...page,
    value: `/${locale.value}${page.to}`,
    label: capitalize(t(page.label)),
    active: route.path === `/${locale.value}${page.to}`,
}));

const selectedPage = ref(myPages.find(p => p.active)?.value || '');

function onPageChange(value) {
    navigateTo(value);
}
</script>

<template>
    <!-- Desktop: Links normales -->
    <div class="hidden lg:flex flex-wrap gap-6">
        <router-link
            v-for="page in myPages"
            :key="page.label"
            :to="page.value"
            :class="['text-sm font-semibold text-center font-outline-bg', page.active ? 'text-black' : 'text-black/50 hover:text-black']">
            {{ page.label }}
        </router-link>
    </div>

    <!-- Tablet: Selector dropdown -->
    <div class="lg:hidden">
        <USelect
            v-model="selectedPage"
            :ui="{
                base: 'p-3  bg-black/5 ring-0 ',
            }"
            :items="myPages"
            @update:model-value="onPageChange"
            class="text-sm font-semibold min-w-36 w-full"
            size="lg" />
    </div>
</template>
