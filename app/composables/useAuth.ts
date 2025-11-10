import { useAuthStore } from '~~/stores/authStore';

/**
 * Composable centralizado para autenticación
 * Proporciona acceso a datos de usuario y estado de autenticación
 */
export const useAuth = () => {
    const authStore = useAuthStore();

    // Computed properties
    const user = computed(() => authStore.user);
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const isLoading = computed(() => authStore.loading);
    const token = computed(() => authStore.auth?.token || null);

    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        token,
    };
};
