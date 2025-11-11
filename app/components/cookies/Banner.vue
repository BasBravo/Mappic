<script setup>
const { showBanner, acceptAll, rejectAll, setModalVisible } = useCookies();

const handleAcceptAll = () => {
    acceptAll();
};

const handleRejectAll = () => {
    rejectAll();
};

const handleCustomize = () => {
    setModalVisible(true);
};
</script>

<template>
    <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0">
        <div v-if="showBanner" class="fixed bottom-0 left-0 right-0 z-50 p-10">
            <div
                class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-black/10 shadow-lg">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <!-- Content -->
                    <div class="flex-1">
                        <div class="flex mb-2 items-center gap-2 text-black">
                            <UIcon name="i-tabler-cookie" class="text-2xl" />
                            <h3 class="text-xl font-semibold">{{ $t('cookies.banner.title') }}</h3>
                        </div>
                        <p class="text-black text-balance pl-8">
                            {{ $t('cookies.banner.description') }}
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                        <UButton color="neutral" variant="outline" @click="handleRejectAll" class="flex-1 sm:flex-none">
                            {{ $t('cookies.banner.rejectAll') }}
                        </UButton>
                        <UButton color="neutral" variant="outline" @click="handleCustomize" class="flex-1 sm:flex-none">
                            {{ $t('cookies.banner.customize') }}
                        </UButton>
                        <UButton color="primary" @click="handleAcceptAll" class="flex-1 sm:flex-none">
                            {{ $t('cookies.banner.acceptAll') }}
                        </UButton>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
