import { defineStore } from 'pinia';

const STORAGE_KEY = 'letters-app-store';

// Helper para guardar en localStorage
function saveToLocalStorage(state: any) {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                styleBgColor: state.styleBgColor,
                sidebarOpen: state.sidebarOpen,
            }));
        } catch (error) {
            console.error('Error saving appStore to localStorage:', error);
        }
    }
}

// Helper para cargar desde localStorage
function loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading appStore from localStorage:', error);
        }
    }
    return null;
}

export const useAppStore = defineStore('app', {
    state: () => {
        const savedState = loadFromLocalStorage();
        return {
            styleBgColor: savedState?.styleBgColor || '#2f3542',
            sidebarOpen: savedState?.sidebarOpen || false,
        };
    },

    actions: {
        setSidebarOpen(open: boolean) {
            this.sidebarOpen = open;
            saveToLocalStorage(this.$state);
        },
    },
});
