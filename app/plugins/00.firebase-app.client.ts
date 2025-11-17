import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp | null = null;

export default defineNuxtPlugin({
    name: 'firebase-app-init',
    parallel: false,
    async setup() {
        const config = useRuntimeConfig();

        // Verificar si Firebase ya está inicializado
        const existingApps = getApps();

        if (existingApps.length === 0) {
            // Inicializar Firebase con la configuración del proyecto
            const firebaseConfig = {
                apiKey: config.public.connectConfig.apiKey,
                authDomain: config.public.connectConfig.authDomain,
                projectId: config.public.connectConfig.projectId,
                storageBucket: config.public.connectConfig.storageBucket,
                messagingSenderId: config.public.connectConfig.messagingSenderId,
                appId: config.public.connectConfig.appId,
            };

            firebaseApp = initializeApp(firebaseConfig);
            console.log('✅ Firebase App inicializado correctamente');
        } else {
            firebaseApp = existingApps[0] || null;
            console.log('✅ Firebase App ya estaba inicializado');
        }

        // Inicializar Firestore
        if (firebaseApp) {
            try {
                const db = getFirestore(firebaseApp);
                console.log('✅ Firestore inicializado correctamente');
            } catch (error) {
                console.error('❌ Error inicializando Firestore:', error);
            }
        }
    },
});
