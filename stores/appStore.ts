import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
    state: () => ({
        styleBgColor: '#2f3542' as string,
        sidebarOpen: false as boolean,
    }),

    actions: {
        setSidebarOpen(open: boolean) {
            this.sidebarOpen = open;
        },
    },

    persist: {
        key: 'letters-app-store',
        paths: ['styleBgColor', 'sidebarOpen'],
    },
});
