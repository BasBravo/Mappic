<script setup lang="ts">
import { useAppStore } from '~~/stores/appStore';
const route = useRoute();
const appStore = useAppStore();

const scrollTopPos = ref(0);

onMounted(() => {
    window.addEventListener('scroll', () => {
        scrollTopPos.value = window.scrollY;
    });

    scrollTopPos.value = window.scrollY;
});

onUnmounted(() => {
    window.removeEventListener('scroll', () => {
        scrollTopPos.value = window.scrollY;
    });
});
</script>

<template>
    <header>
        <div
            class="absolute hidden md:flex translate-y-[4px] opacity-0 transition-all duration-200"
            :class="[{ 'opacity-100 -translate-x-[30px]': scrollTopPos < 100 }, { 'opacity-0 -translate-x-[26px]': scrollTopPos >= 100 }]">
            <NuxtLink to="/">
                <span class="text-4xl font-medium text-[#FF6B5C]">appic</span>
            </NuxtLink>
        </div>
        <div class="flex justify-between items-center pr-2">
            <div class="md:hidden"></div>
            <nav
                class="hidden md:flex col-span-1 items-center gap-10 transition-all duration-200"
                :class="[{ 'translate-x-[80px]': scrollTopPos < 100 }, { '-translate-x-[0px]': scrollTopPos >= 100 }]">
                <div id="HeaderMenu" />
            </nav>
            <div class="flex gap-2 items-center">
                <ButtonLanguage class="hidden md:block" />
                <ButtonAuth />
            </div>
        </div>
    </header>
</template>
