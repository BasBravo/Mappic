<script setup lang="ts">
import { useAppStore } from '~~/stores/appStore';
const route = useRoute();
const appStore = useAppStore();

const scrollTopPos = ref(0);

onMounted(() => {
    window.addEventListener('scroll', () => {
        scrollTopPos.value = window.scrollY;
    });
});

onUnmounted(() => {
    window.removeEventListener('scroll', () => {
        scrollTopPos.value = window.scrollY;
    });
});
</script>

<template>
    <header>
        <div class="flex justify-between items-center px-2">
            <nav class="col-span-1 flex items-center gap-10">
                <div
                    class="hidden md:flex -translate-x-[30px] translate-y-1.5 opacity-0 transition-all duration-200"
                    :class="[
                        { 'opacity-100 -translate-x-[38px]': scrollTopPos < 100 },
                        { 'opacity-0 -translate-x-[30px]': scrollTopPos >= 100 },
                    ]">
                    <span class="text-4xl font-medium font-outline-bg text-[#FF6B5C]">appic</span>
                </div>

                <div id="HeaderMenu" />
            </nav>
            <div class="flex gap-2 items-center">
                <ButtonLanguage class="hidden md:block" />
                <ButtonAuth />
            </div>
        </div>
    </header>
</template>
