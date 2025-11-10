import { useCookieStore } from '~~/stores/cookieStore';

export default defineNuxtPlugin(() => {
  if (!process.client) return;

  const config = useRuntimeConfig();
  const gtagId = config.public.gtagId;

  if (!gtagId) {
    console.warn('Google Analytics ID not configured');
    return;
  }

  const cookieStore = useCookieStore();

  // Cargar preferencias al iniciar
  cookieStore.loadPreferences();

  // Función para inicializar gtag
  const initGtag = () => {
    if (window.gtag) return;

    // Crear script de gtag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
    document.head.appendChild(script);

    // Inicializar gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gtagId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  };

  // Función para activar gtag
  const enableGtag = () => {
    if (!window.gtag) {
      initGtag();
    } else {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  // Función para desactivar gtag
  const disableGtag = () => {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  };

  // Escuchar cambios en preferencias
  watch(
    () => cookieStore.preferences,
    (newPrefs) => {
      if (newPrefs?.analytics) {
        enableGtag();
      } else {
        disableGtag();
      }
    }
  );

  // Inicializar basado en preferencias actuales
  if (cookieStore.preferences?.analytics) {
    initGtag();
  }

  // Exponer funciones globales
  return {
    provide: {
      gtag: {
        enable: enableGtag,
        disable: disableGtag,
      },
    },
  };
});

// Tipos para window
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
