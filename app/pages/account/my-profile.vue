<script setup>
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '~~/stores/authStore';

// definePageMeta({
//     middleware: 'auth',
// });

const { t, locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const loading = ref(false);

// Get current user data
const currentUser = computed(() => authStore.user);

// Handle profile update from form component
function handleProfileUpdated(updatedUser) {
    // Update the auth store with new data
    authStore.setUser(updatedUser);
}

async function handleLogout() {
    loading.value = true;

    try {
        await authStore.logout();
        await navigateTo('/auth/login');
    } catch (err) {
        console.error('Logout error:', err);
    } finally {
        loading.value = false;
    }
}

function goBack() {
    router.back();
}

// Check authentication and SEO on mount
onMounted(async () => {
    // Set SEO - Only on client to avoid hydration mismatches
    if (locale.value == 'es') {
        useSeoMeta({
            title: 'Mi Perfil - Configuración de Cuenta | Mappic',
            ogTitle: 'Mi Perfil - Configuración de Cuenta',
            description: 'Gestiona tu perfil de usuario, actualiza tu información personal y configura tu cuenta de Mappic.',
            ogDescription: 'Gestiona tu perfil de usuario en Mappic. Actualiza información personal y configuración de cuenta.',
            ogImage: '/og-image.png',
            ogUrl: 'https://mappic.app/es/account/my-profile',
            twitterCard: 'summary_large_image',
            twitterTitle: 'Mi Perfil - Mappic',
            twitterDescription: 'Gestiona tu perfil y configuración de cuenta en Mappic.',
            twitterImage: '/og-image.png',
            keywords: 'perfil usuario, configuración cuenta, Mappic, editar perfil, información personal',
            author: 'Bas Bravo',
            robots: 'noindex, nofollow',
            canonical: 'https://mappic.app/es/account/my-profile',
        });
    }
    if (locale.value == 'en') {
        useSeoMeta({
            title: 'My Profile - Account Settings | Mappic',
            ogTitle: 'My Profile - Account Settings',
            description: 'Manage your user profile, update your personal information and configure your Mappic account.',
            ogDescription: 'Manage your user profile on Mappic. Update personal information and account settings.',
            ogImage: '/og-image.png',
            ogUrl: 'https://mappic.app/en/account/my-profile',
            twitterCard: 'summary_large_image',
            twitterTitle: 'My Profile - Mappic',
            twitterDescription: 'Manage your profile and account settings on Mappic.',
            twitterImage: '/og-image.png',
            keywords: 'user profile, account settings, Mappic, edit profile, personal information',
            author: 'Bas Bravo',
            robots: 'noindex, nofollow',
            canonical: 'https://mappic.app/en/account/my-profile',
        });
    }

    // Check authentication
    loading.value = true;

    try {
        // First check if user is already authenticated from store persistence
        if (authStore.isAuthenticated && authStore.user) {
            loading.value = false;
            return;
        }

        // If not authenticated, try to restore from localStorage/cookies
        await authStore.checkAuth();

        // If still not authenticated after check, redirect to login
        if (!authStore.isAuthenticated || !authStore.user) {
            const currentPath = useRoute().fullPath;
            await navigateTo(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }
    } catch (error) {
        console.error('Error checking authentication:', error);

        // On error, redirect to login
        const currentPath = useRoute().fullPath;
        await navigateTo(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="w-full text-black min-h-screen">
        <!-- Espacio inicial -->
        <div class="h-24 md:h-46" />

        <section class="min-h-screen">
            <div class="max-w-4xl mx-auto py-8">
                <!-- Header -->
                <div class="mb-8 px-2 md:px-0">
                    <div class="flex gap-2 mb-6 items-start">
                        <div class="hidden md:flex p-0.5">
                            <UButton icon="i-tabler-chevron-left" variant="ghost" size="xl" @click="goBack" />
                        </div>
                        <div>
                            <h1 class="text-3xl md:text-4xl font-semibold tracking-tight">
                                {{ $t('My Profile') }}
                            </h1>
                            <p class="text-black/60 text-balance mt-1">
                                {{ $t('Manage your account settings and personal information') }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center py-12">
                    <UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin text-gray-400" />
                </div>

                <!-- Main Content -->
                <div v-else class="space-y-6">
                    <!-- Profile Form Component -->
                    <ClientOnly>
                        <FormProfile :user="currentUser" @profile-updated="handleProfileUpdated" />
                        <template #fallback>
                            <div class="flex justify-center py-12">
                                <UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        </template>
                    </ClientOnly>

                    <!-- Account Actions -->
                    <CardDefault>
                        <div class="w-full space-y-6">
                            <h3 class="text-lg font-semibold">
                                {{ $t('Account Actions') }}
                            </h3>

                            <div class="space-y-4">
                                <!-- My Maps -->
                                <a :href="`/${locale}/maps/my-maps`" class="flex items-center justify-between p-4 bg-gray-100 rounded-3xl">
                                    <div class="flex items-center gap-5">
                                        <UIcon name="i-tabler-map" class="w-6 h-6" />
                                        <div>
                                            <h4 class="font-medium">
                                                {{ $t('My Maps') }}
                                            </h4>
                                            <p class="text-sm text-black/60">
                                                {{ $t('View and manage your created maps') }}
                                            </p>
                                        </div>
                                    </div>
                                    <UButton icon="i-tabler-arrow-right" variant="ghost" to="/maps/my-maps" />
                                </a>

                                <!-- Change Password -->
                                <a
                                    :href="`/${locale}/auth/reset-password`"
                                    class="flex items-center justify-between p-4 bg-gray-100 rounded-3xl">
                                    <div class="flex items-center gap-5">
                                        <UIcon name="i-tabler-map" class="w-6 h-6" />
                                        <div>
                                            <h4 class="font-medium">
                                                {{ $t('Change Password') }}
                                            </h4>
                                            <p class="text-sm text-black/60">
                                                {{ $t('Update your account password') }}
                                            </p>
                                        </div>
                                    </div>
                                    <UButton icon="i-tabler-arrow-right" variant="ghost" to="/auth/reset-password" />
                                </a>

                                <!-- Logout -->
                                <a
                                    href="#"
                                    class="flex items-center justify-between p-4 bg-red-100 rounded-3xl"
                                    @click.prevent="handleLogout">
                                    <div class="flex items-center gap-5">
                                        <UIcon name="i-tabler-map" class="w-6 h-6" />
                                        <div>
                                            <h4 class="font-medium">
                                                {{ $t('Sign Out') }}
                                            </h4>
                                            <p class="text-sm text-black/60">
                                                {{ $t('Sign out of your account') }}
                                            </p>
                                        </div>
                                    </div>
                                    <UButton icon="i-tabler-power" variant="ghost" :loading="loading" />
                                </a>
                            </div>
                        </div>
                    </CardDefault>
                </div>
            </div>
        </section>
    </div>
</template>
