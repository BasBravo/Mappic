<script setup>
import { ref } from 'vue';
import { navigationConfig } from '~~/data/nav';
import { useAppStore } from '~~/stores/appStore';

const appStore = useAppStore();
const route = useRoute();
const isOpen = ref(false);
const expandedThreads = ref(false);
const expandedDrafts = ref(false);
const expandedFolders = ref(false);
const isMobileMenuOpen = ref(false);
const isMobile = ref(false);

const { primaryMenuItems, bottomMenuItems, utilityItems, expandableItems } = navigationConfig;

const openSidebar = () => {
    isOpen.value = true;
    appStore.setSidebarOpen(true);
};

const closeSidebar = () => {
    isOpen.value = false;
    appStore.setSidebarOpen(false);
};

// Add delay to prevent accidental closing
let closeTimeout = null;

const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => {
        closeSidebar();
    }, 150);
};

const handleMouseEnter = () => {
    if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
    }
    openSidebar();
};

const toggleExpanded = item => {
    if (item.id === 'threads') {
        expandedThreads.value = !expandedThreads.value;
    } else if (item.id === 'drafts') {
        expandedDrafts.value = !expandedDrafts.value;
    } else if (item.id === 'folders') {
        expandedFolders.value = !expandedFolders.value;
    }
};

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
};

// Check if we're on mobile viewport
const checkMobile = () => {
    isMobile.value = window.innerWidth < 768; // md breakpoint
};

// Close sidebar on route change (only on mobile)
watch(
    () => route.path,
    () => {
        if (isMobile.value && isMobileMenuOpen.value) {
            closeMobileMenu();
        }
    }
);

// Handle window resize
const handleResize = () => {
    checkMobile();
};

// Lifecycle
onMounted(() => {
    checkMobile();
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<template>
    <!-- Mobile Hamburger Button -->
    <div class="md:hidden fixed top-7 left-5 z-50">
        <div>
            <EffectGlass class="rounded-full p-1">
                <UButton
                    @click="toggleMobileMenu"
                    variant="ghost"
                    size="xl"
                    :icon="isMobileMenuOpen ? 'i-tabler-x' : 'i-tabler-menu-2'"></UButton>
            </EffectGlass>
        </div>
    </div>

    <!-- Mobile Sidebar -->
    <div
        class="md:hidden fixed pt-20 top-0 left-0 z-40 h-full transition-transform duration-300 ease-in-out"
        :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'">
        <!-- Bg -->
        <div
            class="fixed top-0 left-0 z-0 transition-all duration-200 ease-in-out pointer-events-none w-[1000px] h-full bg-gradient-to-r from-background from-20% to-background/0 to-100%"
            :class="isMobileMenuOpen ? '-translate-x-0' : '-translate-x-[1000px]'"></div>
        <!-- Content -->
        <div class="relative z-10flex flex-col py-6 px-1 h-full">
            <!-- LOGO -->
            <div class="flex px-6 pt-2 pb-4 gap-3 items-center">
                <NuxtLink class="w-10 h-10 flex items-center justify-center" to="/">
                    <Logo />
                </NuxtLink>
                <span class="text-4xl font-medium font-outline-bg text-[#FF6B5C] -translate-x-2.5 translate-y-[9px]">appic</span>
            </div>

            <!-- Mobile Primary Items -->
            <div class="flex flex-col">
                <template v-for="item in primaryMenuItems" :key="item.id">
                    <NuxtLink v-if="item.route" :to="item.route" @click="closeMobileMenu" class="flex items-center px-4 py-2">
                        <div class="h-12 w-12 rounded-full flex items-center justify-center">
                            <UIcon :name="item.icon" class="text-xl text-gray-700" />
                        </div>
                        <span class="font-semibold text-gray-800">{{ $t(item.label) }}</span>
                    </NuxtLink>
                </template>
            </div>
        </div>
    </div>

    <!-- Desktop Sidebar (Original) -->
    <div class="hidden md:flex h-full">
        <div
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            class="relative z-10 flex transition-all duration-300 ease-in-out overflow-hidden"
            :class="isOpen ? 'w-[230px]' : 'w-12'">
            <div class="w-full flex flex-col pt-2 pb-4 space-y-4 flex-shrink-0">
                <!-- LOGO -->
                <div class="flex flex-col space-y-3 px-3">
                    <div class="w-10 h-10 flex items-center justify-center">
                        <!-- <span class="text-gray-700 text-lg">✦</span> -->
                        <!-- <img src="/img/logo-dark.svg" class="w-8" /> -->
                        <a href="/">
                            <Logo class="w-8" />
                        </a>
                    </div>
                </div>

                <!-- PRIMARY ITEMS -->
                <div class="flex flex-col space-y-4 p-3">
                    <template v-for="item in primaryMenuItems" :key="item.id">
                        <NuxtLink
                            v-if="item.route"
                            :to="item.route"
                            class="flex gap-0.5 items-center cursor-pointer hover:bg-black/10 rounded-2xl transition-colors">
                            <div class="h-10 min-w-10 rounded-full flex items-center justify-center relative">
                                <UIcon :name="item.icon" class="text-xl" />
                            </div>
                            <span class="whitespace-nowrap font-semibold">{{ $t(item.label) }}</span>
                        </NuxtLink>
                    </template>
                </div>

                <div class="w-8 mt-auto"></div>

                <!-- Bottom Icons -->
                <div class="flex flex-col space-y-3 p-3">
                    <div id="SidebarBottom" />
                    <a
                        v-for="item in utilityItems"
                        :key="item.id"
                        class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <UIcon :name="item.icon" class="text-lg" />
                    </a>
                </div>
            </div>
        </div>
        <div
            class="fixed top-0 left-0 z-0 transition-all duration-200 ease-in-out pointer-events-none w-[1000px] h-full bg-gradient-to-r from-background from-15% to-background/0 to-100%"
            :class="isOpen ? '-translate-x-0' : '-translate-x-[1000px]'"></div>
    </div>
</template>
