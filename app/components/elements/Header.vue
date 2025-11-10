<script setup lang="ts">
import { useAppStore } from '~~/stores/appStore';
const route = useRoute();
const appStore = useAppStore();
</script>

<template>
    <header>
        <div class="flex justify-between items-center px-2">
            <nav class="col-span-1 flex items-center gap-10">
                <div
                    class="hidden md:flex -translate-x-6 translate-y-2.5 opacity-0 transition-all duration-200"
                    :class="{ 'opacity-100 -translate-x-9': appStore.sidebarOpen }">
                    <span class="text-2xl font-semibold font-outline-bg">appic</span>
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
