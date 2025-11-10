import { useAuthStore } from '~~/stores/authStore';
import { createAuth } from '~~/shared/services/auth';
import { createUser } from '~~/shared/services/user';

/**
 * Composable para manejar la sesión de autenticación
 * Usa Firebase Auth como fuente de verdad
 */
export const useAuthSession = () => {
    const authStore = useAuthStore();
    const authService = createAuth();
    const userService = createUser();

    /**
     * Restaurar sesión desde Firebase Auth
     * Se ejecuta al inicializar la app
     */
    const restoreSession = async () => {
        try {
            // Esperar a que Firebase se inicialice
            await authService._init();

            // Obtener usuario actual de Firebase Auth
            const firebaseAuth = authService._firebaseAuth;
            if (!firebaseAuth) {
                console.warn('Firebase Auth not initialized');
                return;
            }

            // Esperar a que Firebase Auth esté listo
            return new Promise((resolve) => {
                const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
                    unsubscribe();

                    if (user) {
                        try {
                            // Obtener token
                            const token = await user.getIdToken();

                            // Obtener datos del usuario desde Firestore
                            const userData = await userService.getUser(user.uid);

                            if (userData.success && userData.data) {
                                // Guardar en store
                                authStore.saveUser({
                                    auth: {
                                        token,
                                        uid: user.uid,
                                        email: user.email || '',
                                    },
                                    data: {
                                        uid: user.uid,
                                        email: user.email || '',
                                        name: userData.data.name || user.displayName || 'User',
                                        avatar: userData.data.photoURL || user.photoURL,
                                    },
                                });

                                console.log('Session restored from Firebase Auth');
                            }
                        } catch (error) {
                            console.error('Error restoring session:', error);
                        }
                    } else {
                        // No hay usuario autenticado
                        authStore.clear();
                    }

                    resolve(user);
                });
            });
        } catch (error) {
            console.error('Error in restoreSession:', error);
        }
    };

    return {
        restoreSession,
    };
};
