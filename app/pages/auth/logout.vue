<script setup>
import { useAuthStore } from '~~/stores/authStore';

const authStore = useAuthStore();
const route = useRoute();

const redirect = route.query.redirect;

// Perform logout immediately
onBeforeMount(async () => {
    // Clear auth store
    authStore.clear();

    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));

    // Redirect to specified URL or home
    if (redirect) {
        const url = new URL(redirect);
        url.searchParams.set('logout', 'true');
        await navigateTo(url.toString(), { external: true });
    } else {
        await navigateTo('/');
    }
});
</script>

<template>
    <div class="min-h-[calc(100dvh-4rem)] flex justify-center bg-gray-50">
        <div class="text-center my-auto py-8">
            <UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p class="text-gray-600">{{ $t('logging out') }}...</p>
        </div>
    </div>
</template>
