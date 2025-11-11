import { defineStore } from 'pinia';

interface User {
    uid: string;
    email: string;
    name: string;
    avatar?: string;
}

interface AuthData {
    token: string;
    uid: string;
    email: string;
}

interface AuthState {
    user: User | null;
    auth: AuthData | null;
    isAuthenticated: boolean;
    loading: boolean;
}

const STORAGE_KEY = 'mappic-auth-store';

// Helper para guardar en localStorage
function saveToLocalStorage(state: AuthState) {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                user: state.user,
                auth: state.auth,
                isAuthenticated: state.isAuthenticated
            }));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
}

// Helper para cargar desde localStorage
function loadFromLocalStorage(): Partial<AuthState> | null {
    if (typeof window !== 'undefined') {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }
    return null;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => {
        // Cargar estado inicial desde localStorage
        const savedState = loadFromLocalStorage();
        
        console.log('[AuthStore] Inicializando store...');
        console.log('[AuthStore] Estado cargado desde localStorage:', savedState);
        
        return {
            user: savedState?.user || null,
            auth: savedState?.auth || null,
            isAuthenticated: savedState?.isAuthenticated || false,
            loading: false,
        };
    },

    actions: {
        saveUser(userData: { auth: AuthData; data: User }) {
            this.auth = userData.auth;
            this.user = userData.data;
            this.isAuthenticated = true;

            // Guardar en localStorage
            saveToLocalStorage(this.$state);
        },

        setUser(user: User) {
            this.user = user;
            this.isAuthenticated = true;
            
            // Guardar en localStorage
            saveToLocalStorage(this.$state);
        },

        clear() {
            this.user = null;
            this.auth = null;
            this.isAuthenticated = false;

            // Limpiar localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY);
            }
        },

        setLoading(loading: boolean) {
            this.loading = loading;
        },

        getTokenEncrypted(): string | null {
            return this.auth?.token || null;
        },

        /**
         * Verifica si la sesión persistida es válida
         * Se usa al restaurar la sesión después de un refresh
         */
        async validateSession() {
            try {
                // Si no hay datos persistidos, no hay nada que validar
                if (!this.user || !this.auth?.token) {
                    console.log('[Store] No hay sesión persistida para validar');
                    return false;
                }
                
                console.log('[Store] Validando sesión persistida...');
                console.log('[Store] Usuario:', this.user.name, this.user.email);
                console.log('[Store] Token presente:', !!this.auth.token);
                
                // La sesión persistida es válida si tenemos usuario y token
                // Firebase Auth mantiene la sesión automáticamente en el navegador
                return true;
            } catch (error) {
                console.error('[Store] Error validando sesión:', error);
                this.clear();
                return false;
            }
        },

        async logout() {
            this.loading = true;

            try {
                // Sign out from Firebase
                const authService = (await import('~~/shared/services/auth')).createAuth();
                await authService._init();
                
                if (authService._firebaseAuth?.logout) {
                    await authService._firebaseAuth.logout();
                }
                
                // Clear local state
                this.clear();
            } catch (error) {
                console.error('Logout failed:', error);
                // Always clear local state on error
                this.clear();
            } finally {
                this.loading = false;
            }
        },
    },
});
