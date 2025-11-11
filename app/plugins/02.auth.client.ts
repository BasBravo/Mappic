import { useAuthSession } from '~/composables/useAuthSession';

import { useAuthStore } from '~~/stores/authStore';

/**
 * Plugin de autenticación
 * Se ejecuta después de que Pinia restaura el estado persistido
 * Verifica la sesión con Firebase Auth y sincroniza el token
 */
export default defineNuxtPlugin({
    name: 'auth-restore',
    parallel: false,
    async setup() {
        // Only run on client side
        if (process.server) return;
        
        try {
            console.log('[Plugin Auth] Inicializando plugin de autenticación...');
            
            // Verificar estado del store ANTES de restaurar
            const authStore = useAuthStore();
            console.log('[Plugin Auth] Estado inicial del store:');
            console.log('[Plugin Auth] - isAuthenticated:', authStore.isAuthenticated);
            console.log('[Plugin Auth] - user:', authStore.user);
            console.log('[Plugin Auth] - auth:', authStore.auth);
            
            const { restoreSession } = useAuthSession();
            
            // Restore session from Firebase Auth
            // Pinia has already restored the persisted state from localStorage
            await restoreSession();
            
            // Verificar estado del store DESPUÉS de restaurar
            console.log('[Plugin Auth] Estado final del store:');
            console.log('[Plugin Auth] - isAuthenticated:', authStore.isAuthenticated);
            console.log('[Plugin Auth] - user:', authStore.user);
            
            console.log('[Plugin Auth] Plugin de autenticación inicializado ✓');
        } catch (error) {
            console.error('[Plugin Auth] Error al inicializar plugin de autenticación:', error);
            // Don't throw - allow app to continue even if auth check fails
        }
    }
});
