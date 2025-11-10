import { useAuthStore } from '~~/stores/authStore';

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
        // Redirect to login page with return URL
        return navigateTo({
            path: '/auth/login',
            query: { redirect: to.fullPath },
        });
    }
});
