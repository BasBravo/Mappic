// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url';

const isDev = process.env.NODE_ENV === 'development';
const functionName = isDev ? 'server_dev' : 'server';

export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: { enabled: true },
    modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/i18n'],
    colorMode: {
        preference: 'light',
        fallback: 'light',
        hid: 'nuxt-color-mode-script',
        globalName: '__NUXT_COLOR_MODE__',
        componentName: 'ColorScheme',
        classPrefix: '',
        classSuffix: '',
        storageKey: 'nuxt-color-mode',
    },
    alias: {
        '~~/shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
    app: {
        pageTransition: false,
        layoutTransition: false,
        head: {
            link: [
                {
                    rel: 'preconnect',
                    href: 'https://fonts.googleapis.com',
                },
                {
                    rel: 'preconnect',
                    href: 'https://fonts.gstatic.com',
                    crossorigin: '',
                },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.cdnfonts.com/css/sf-pro-display',
                },
            ],
            script: [],
        },
    },
    css: ['~/assets/css/main.css', '~/assets/css/transitions.css'],
    routeRules: {
        // Habilitar SSR para las páginas de about
        '/*/about/**': { ssr: true },
        '/*/about': { ssr: true },
        // Deshabilitar SSR para todas las demás rutas
        '/': { ssr: false },
        '/*/': { ssr: false },
        '/*/maps/**': { ssr: false },
        '/*/auth/**': { ssr: false },
        '/*/account/**': { ssr: false },
        '/*/stripe/**': { ssr: false },
    },
    i18n: {
        strategy: 'prefix',
        defaultLocale: 'en',
        langDir: 'locales',
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_redirected',
            redirectOn: 'root',
            alwaysRedirect: true,
            fallbackLocale: 'en',
        },
        locales: [
            {
                code: 'en',
                file: 'en.js',
            },
            {
                code: 'es',
                file: 'es.js',
            },
            {
                code: 'zh',
                file: 'zh.js',
            },
        ],
        compilation: {
            strictMessage: false,
        },
    },
    runtimeConfig: {
        public: {
            storageUrl: process.env.NUXT_STORAGE_URL,
            functionsUrl: process.env.NUXT_FUNCTIONS_URL,
            hostUrl: process.env.NUXT_APP_URL,
            connectProvider: process.env.NUXT_PROVIDER_DATA,
            connectConfig: {
                appName: process.env.NUXT_APP_NAME,
                apiKey: process.env.NUXT_APP_KEY,
                authDomain: process.env.NUXT_AUTH_DOMAIN,
                projectId: process.env.NUXT_PROJECT_ID,
                storageBucket: process.env.NUXT_STORAGE_BUCKET,
                messagingSenderId: process.env.NUXT_MESSAGING_SENDER_ID,
                appId: process.env.NUXT_APP_ID,
                measurementId: process.env.NUXT_MEASUREMENT_ID,
            },
            algolia: {},
            stripe: {
                publicKey: process.env.NUXT_STRIPE_PUBLIC_KEY,
                secretKey: process.env.NUXT_STRIPE_SECRET_KEY,
            },
            mapbox: {
                apiKey: process.env.NUXT_MAPBOX_API_KEY,
            },
            gtagId: process.env.NUXT_GOOGLE_GTAG_ID,
            cryptoKey: process.env.NUXT_CRYPTO_KEY,
            cookies: {
                expirationDays: 365,
                storageKey: 'mappic_cookies_consent',
            },
        },
    },
    vite: {
        server: {
            fs: {
                strict: false,
            },
        },
    },
    postcss: {
        plugins: {
            '@tailwindcss/postcss': {},
            autoprefixer: {},
        },
    },
    nitro: {
        preset: 'firebase',
        firebase: { nodeVersion: '20', gen: 2, httpsOptions: { region: 'europe-west3', maxInstances: 3 } },
        rollupConfig: {
            external: id => {
                // Excluir archivos .vue del procesamiento de Rollup en Nitro
                return id.endsWith('.vue');
            },
        },
        replace: {
            [`as server } from './chunks/`]: `as server } from './chunks/`,
            [`functions.https.onRequest`]: `functions.region('europe-west3').https.onRequest`,
            [`export { ${functionName}`]: `export { ${functionName}`,
        },
    },
});
