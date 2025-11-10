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

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        auth: null,
        isAuthenticated: false,
        loading: false,
    }),

    actions: {
        saveUser(userData: { auth: AuthData; data: User }) {
            this.auth = userData.auth;
            this.user = userData.data;
            this.isAuthenticated = true;

            // Store token in localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', userData.auth.token);
            }
        },

        setUser(user: User) {
            this.user = user;
            this.isAuthenticated = true;
        },

        clear() {
            this.user = null;
            this.auth = null;
            this.isAuthenticated = false;

            // Remove token from localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
            }
        },

        setLoading(loading: boolean) {
            this.loading = loading;
        },

        getTokenEncrypted(): string | null {
            return this.auth?.token || null;
        },


        async logout() {
            this.loading = true;

            try {
                // Sign out from Firebase
                const authService = (await import('~~/shared/services/auth')).createAuth();
                await authService._init();
                
                if (authService._firebaseAuth?.signOut) {
                    await authService._firebaseAuth.signOut();
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

    persist: {
        key: 'mappic-auth-store',
        paths: ['user', 'auth', 'isAuthenticated'],
    },
});
