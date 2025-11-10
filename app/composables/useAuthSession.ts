import { useAuthStore } from '~~/stores/authStore';
import { createAuth } from '~~/shared/services/auth';

/**
 * Composable para manejar la sesión de autenticación
 * Restaura sesión desde localStorage (persistida por Pinia)
 */
export const useAuthSession = () => {
    const authStore = useAuthStore() as any;

    /**
     * Restaurar sesión desde localStorage
     * Se ejecuta al inicializar la app
     * Pinia ya restaura automáticamente el estado persistido
     */
    const restoreSession = async () => {
        try {
            // Pinia ya ha restaurado el estado persistido desde localStorage
            // Solo necesitamos validar que el token sea válido
            
            if (authStore.isAuthenticated && authStore.auth?.token && authStore.user?.uid) {
                try {
                    // Validar token con el backend
                    const authService = createAuth();
                    const tokenValidation = await authService.verifyToken(authStore.auth.token);
                    
                    if (!tokenValidation.success) {
                        // Token inválido, limpiar sesión
                        console.warn('Token validation failed, clearing session');
                        authStore.clear();
                    } else {
                        console.log('Session restored from localStorage');
                    }
                } catch (error) {
                    console.error('Error validating token:', error);
                    // En caso de error, mantener la sesión (podría ser un problema de red)
                }
            }
        } catch (error) {
            console.error('Error in restoreSession:', error);
        }
    };

    return {
        restoreSession,
    };
};
