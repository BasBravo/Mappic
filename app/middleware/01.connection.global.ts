import { createConnection } from '~~/shared/services/connection';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export default defineNuxtRouteMiddleware(async (to, from) => {
    // Only run on client side
    if (process.server) return;

    // If already initialized, skip
    if (isInitialized) return;

    // If initialization is in progress, wait for it
    if (initializationPromise) {
        await initializationPromise;
        return;
    }

    // Start initialization
    initializationPromise = initializeConnection();
    await initializationPromise;
});

async function initializeConnection(): Promise<void> {
    try {
        const config = useRuntimeConfig();
        const connectionService = createConnection();

        await connectionService.initialize(config.public.connectConfig);
        isInitialized = true;

        console.log('Firebase connection initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Firebase connection:', error);
        // Mark as initialized even on error to prevent infinite retries
        isInitialized = true;
        throw error;
    }
}
