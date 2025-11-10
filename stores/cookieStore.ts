import { defineStore } from 'pinia';
import type { CookiePreferences, CookieState } from '~/types/cookies';

const STORAGE_KEY = 'mappic_cookies_consent';
const COOKIE_VERSION = 1;

export const useCookieStore = defineStore('cookies', () => {
  const state = ref<CookieState>({
    preferences: null,
    showBanner: true,
    showModal: false,
  });

  // Cargar preferencias del localStorage
  const loadPreferences = () => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as CookiePreferences;
          state.value.preferences = parsed;
          state.value.showBanner = false;
          return parsed;
        } catch (e) {
          console.error('Error parsing cookie preferences:', e);
        }
      }
    }
    return null;
  };

  // Guardar preferencias en localStorage
  const savePreferences = (preferences: CookiePreferences) => {
    if (process.client) {
      const toSave: CookiePreferences = {
        ...preferences,
        timestamp: Date.now(),
        version: COOKIE_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      state.value.preferences = toSave;
      state.value.showBanner = false;
    }
  };

  // Aceptar todas las cookies
  const acceptAll = () => {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: Date.now(),
      version: COOKIE_VERSION,
    };
    savePreferences(preferences);
  };

  // Rechazar todas (excepto necessary)
  const rejectAll = () => {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: Date.now(),
      version: COOKIE_VERSION,
    };
    savePreferences(preferences);
  };

  // Actualizar preferencias individuales
  const updatePreferences = (updates: Partial<CookiePreferences>) => {
    const current = state.value.preferences || {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: Date.now(),
      version: COOKIE_VERSION,
    };

    const updated: CookiePreferences = {
      ...current,
      ...updates,
      necessary: true, // Necessary siempre true
      timestamp: Date.now(),
      version: COOKIE_VERSION,
    };

    savePreferences(updated);
  };

  // Mostrar/ocultar banner
  const setBannerVisible = (visible: boolean) => {
    state.value.showBanner = visible;
  };

  // Mostrar/ocultar modal
  const setModalVisible = (visible: boolean) => {
    state.value.showModal = visible;
  };

  // Verificar si una categoría está aceptada
  const isAccepted = (category: keyof Omit<CookiePreferences, 'timestamp' | 'version'>) => {
    return state.value.preferences?.[category] ?? false;
  };

  // Limpiar todas las preferencias
  const clearPreferences = () => {
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY);
    }
    state.value.preferences = null;
    state.value.showBanner = true;
  };

  return {
    // State
    preferences: computed(() => state.value.preferences),
    showBanner: computed(() => state.value.showBanner),
    showModal: computed(() => state.value.showModal),

    // Methods
    loadPreferences,
    savePreferences,
    acceptAll,
    rejectAll,
    updatePreferences,
    setBannerVisible,
    setModalVisible,
    isAccepted,
    clearPreferences,
  };
});
