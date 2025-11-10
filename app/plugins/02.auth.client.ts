import { useAuthSession } from '~/composables/useAuthSession';

export default defineNuxtPlugin({
    name: 'auth-restore',
    parallel: false,
    async setup() {
        // Only run on client side
        if (process.server) return;
        
        try {
            const { restoreSession } = useAuthSession();
            
            // Restore session from localStorage
            // Pinia has already restored the persisted state
            await restoreSession();
        } catch (error) {
            console.error('Auth plugin initialization failed:', error);
            // Don't throw - allow app to continue even if auth check fails
        }
    }
});
