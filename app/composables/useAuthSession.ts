import { useAuthStore } from '~~/stores/authStore';
import { createAuth } from '~~/shared/services/auth';

/**
 * Composable para manejar la sesión de autenticación
 * Restaura sesión desde Firebase Auth (fuente de verdad)
 */
export const useAuthSession = () => {
    const authStore = useAuthStore();

    /**
     * Restaurar sesión desde localStorage
     * Se ejecuta al inicializar la app
     * 
     * Flujo:
     * 1. Pinia restaura el estado desde localStorage automáticamente
     * 2. Validamos que los datos persistidos existan
     * 3. Firebase Auth mantiene la sesión automáticamente en el navegador
     */
    const restoreSession = async () => {
        try {
            console.log('[Auth] Iniciando restauración de sesión...');
            console.log('[Auth] Estado actual del store:');
            console.log('[Auth] - isAuthenticated:', authStore.isAuthenticated);
            console.log('[Auth] - user:', authStore.user);
            console.log('[Auth] - auth:', authStore.auth);
            
            // Validar sesión persistida
            const isValid = await authStore.validateSession();
            
            if (isValid) {
                console.log('[Auth] ✓ Sesión restaurada correctamente');
                console.log('[Auth] Usuario:', authStore.user?.name, authStore.user?.email);
            } else {
                console.log('[Auth] ✗ No hay sesión válida');
            }
        } catch (error) {
            console.error('[Auth] Error en restoreSession:', error);
            // En caso de error crítico, limpiar la sesión
            authStore.clear();
        }
    };

    return {
        restoreSession,
    };
};
