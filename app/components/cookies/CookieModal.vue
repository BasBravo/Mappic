<template>
    <ElementsModal v-model:open="isOpen" :ui="{ width: 'w-full sm:max-w-md' }">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ $t('cookies.modal.title') }}
            </h2>
        </div>

        <!-- Content -->
        <div class="space-y-4">
            <!-- Necessary -->
            <div class="flex items-start gap-3">
                <UCheckbox v-model="localPreferences.necessary" disabled class="mt-1" />
                <div class="flex-1">
                    <h3 class="font-medium text-slate-900 dark:text-white">
                        {{ $t('cookies.modal.necessary') }}
                    </h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {{ $t('cookies.modal.descriptions.necessary') }}
                    </p>
                </div>
            </div>

            <!-- Analytics -->
            <div class="flex items-start gap-3">
                <UCheckbox v-model="localPreferences.analytics" class="mt-1" />
                <div class="flex-1">
                    <h3 class="font-medium text-slate-900 dark:text-white">
                        {{ $t('cookies.modal.analytics') }}
                    </h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {{ $t('cookies.modal.descriptions.analytics') }}
                    </p>
                </div>
            </div>

            <!-- Marketing -->
            <div class="flex items-start gap-3">
                <UCheckbox v-model="localPreferences.marketing" class="mt-1" />
                <div class="flex-1">
                    <h3 class="font-medium text-slate-900 dark:text-white">
                        {{ $t('cookies.modal.marketing') }}
                    </h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {{ $t('cookies.modal.descriptions.marketing') }}
                    </p>
                </div>
            </div>

            <!-- Preferences -->
            <div class="flex items-start gap-3">
                <UCheckbox v-model="localPreferences.preferences" class="mt-1" />
                <div class="flex-1">
                    <h3 class="font-medium text-slate-900 dark:text-white">
                        {{ $t('cookies.modal.preferences') }}
                    </h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {{ $t('cookies.modal.descriptions.preferences') }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="flex gap-2 justify-end mt-12">
            <UButton color="neutral" variant="outline" @click="handleRejectAll">
                {{ $t('cookies.banner.rejectAll') }}
            </UButton>
            <UButton color="neutral" variant="outline" @click="handleSave">
                {{ $t('cookies.modal.save') }}
            </UButton>
            <UButton color="primary" @click="handleAcceptAll">
                {{ $t('cookies.banner.acceptAll') }}
            </UButton>
        </div>
    </ElementsModal>
</template>

<script setup>
const { showModal, preferences, updatePreferences, acceptAll, rejectAll, setModalVisible } = useCookies();

const isOpen = computed({
    get: () => showModal.value,
    set: value => setModalVisible(value),
});

const localPreferences = ref({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
});

// Sincronizar con preferencias globales
watch(
    () => preferences.value,
    newPrefs => {
        if (newPrefs) {
            localPreferences.value = {
                necessary: newPrefs.necessary,
                analytics: newPrefs.analytics,
                marketing: newPrefs.marketing,
                preferences: newPrefs.preferences,
            };
        }
    },
    { immediate: true }
);

const handleAcceptAll = () => {
    acceptAll();
    isOpen.value = false;
};

const handleRejectAll = () => {
    rejectAll();
    isOpen.value = false;
};

const handleSave = () => {
    updatePreferences(localPreferences.value);
    isOpen.value = false;
};
</script>
