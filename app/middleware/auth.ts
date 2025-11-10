import { useAuthStore } from '~~/stores/authStore';

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    // Check if user is authenticated and has valid data
    if (!authStore.isAuthenticated || !authStore.user || !authStore.auth?.token) {
        // Redirect to login page with return URL
        return navigateTo({
            path: '/auth/login',
            query: { redirect: to.fullPath },
        });
    }
});
