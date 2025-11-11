<script setup>
//
// IMPORTS
//
import { ref } from 'vue';
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

//
// FUNCTIONS
//
function onPageChange(value) {
    navigateTo(value);
}
</script>

<template>
    <!-- Desktop -->
    <div class="hidden md:flex">
        <ClientOnly>
            <teleport to="#HeaderMenu">
                <EffectGlass class="flex items-center rounded-full p-1" :displace="2">
                    <USelect
                        v-model="selectedPage"
                        :ui="{
                            base: 'p-2 bg-transparent ring-0 ',
                        }"
                        :items="myPages"
                        @update:model-value="onPageChange"
                        class="text-sm font-semibold min-w-36 w-full"
                        size="lg" />
                </EffectGlass>
            </teleport>
        </ClientOnly>
    </div>
    <!-- Mobile -->
    <div class="md:hidden">
        <ClientOnly>
            <teleport to="#HeaderMenuMobile">
                <USelect
                    v-model="selectedPage"
                    :ui="{
                        base: 'bg-transparent ring-0 ',
                        content: 'min-w-36 ',
                    }"
                    :items="myPages"
                    @update:model-value="onPageChange"
                    class="text-sm font-semibold w-full"
                    size="lg" />
            </teleport>
        </ClientOnly>
    </div>
</template>
