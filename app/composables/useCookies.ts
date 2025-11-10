import { useCookieStore } from '~~/stores/cookieStore';

export function useCookies() {
  const cookieStore = useCookieStore();

  // Inicializar al montar
  onMounted(() => {
    cookieStore.loadPreferences();
  });

  return {
    // State
    preferences: computed(() => cookieStore.preferences),
    showBanner: computed(() => cookieStore.showBanner),
    showModal: computed(() => cookieStore.showModal),

    // Methods
    acceptAll: () => cookieStore.acceptAll(),
    rejectAll: () => cookieStore.rejectAll(),
    updatePreferences: (updates: any) => cookieStore.updatePreferences(updates),
    setBannerVisible: (visible: boolean) => cookieStore.setBannerVisible(visible),
    setModalVisible: (visible: boolean) => cookieStore.setModalVisible(visible),
    isAccepted: (category: string) => cookieStore.isAccepted(category as any),
    clearPreferences: () => cookieStore.clearPreferences(),
  };
}
