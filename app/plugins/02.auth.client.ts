import { useAuthSession } from '~/composables/useAuthSession';

export default defineNuxtPlugin(async () => {
    // Only run on client side
    if (process.server) return;
    
    try {
        const { restoreSession } = useAuthSession();
        
        // Restore session from Firebase Auth
        // This is the source of truth for authentication
        await restoreSession();
    } catch (error) {
        console.error('Auth plugin initialization failed:', error);
        // Don't throw - allow app to continue even if auth check fails
    }
});
