import { defineStore } from 'pinia';

interface Location {
    lat: string;
    lon: string;
    display_name: string;
    name: string;
    place_id: string;
    osm_type: string;
    osm_id: string;
    class: string;
    type: string;
    importance: number;
    boundingbox: string[];
}

const STORAGE_KEY = 'mappic-map-store';

// Helper para guardar en localStorage
function saveToLocalStorage(state: any) {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                selectedLocation: state.selectedLocation,
                mapTitle: state.mapTitle,
                mapSubtitle: state.mapSubtitle,
                mapTitleSize: state.mapTitleSize,
                mapSubtitleSize: state.mapSubtitleSize,
                selectedStyle: state.selectedStyle,
                selectedComposition: state.selectedComposition,
                showInfo: state.showInfo,
                customInfo: state.customInfo,
                mapAspect: state.mapAspect,
                mapLandscape: state.mapLandscape,
                mapBounds: state.mapBounds,
                mapZoom: state.mapZoom,
                mapWidth: state.mapWidth,
                mapHeight: state.mapHeight,
            }));
        } catch (error) {
            console.error('Error saving mapStore to localStorage:', error);
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
            console.error('Error loading mapStore from localStorage:', error);
        }
    }
    return null;
}

export const useMapStore = defineStore('map', {
    state: () => {
        const savedState = loadFromLocalStorage();
        return {
            selectedLocation: savedState?.selectedLocation || null,
            mapTitle: savedState?.mapTitle || '',
            mapSubtitle: savedState?.mapSubtitle || '',
            mapTitleSize: savedState?.mapTitleSize || 50,
            mapSubtitleSize: savedState?.mapSubtitleSize || 50,
            selectedStyle: savedState?.selectedStyle || 'minimal',
            selectedComposition: savedState?.selectedComposition || 'classy',
            showInfo: savedState?.showInfo !== undefined ? savedState.showInfo : true,
            customInfo: savedState?.customInfo || '',
            mapAspect: savedState?.mapAspect || '50:70',
            mapLandscape: savedState?.mapLandscape || false,
            mapBounds: savedState?.mapBounds || null,
            mapZoom: savedState?.mapZoom || null,
            mapWidth: savedState?.mapWidth || null,
            mapHeight: savedState?.mapHeight || null,
        };
    },

    actions: {
        setSelectedLocation(location: Location) {
            this.selectedLocation = location;
            // Auto-generate title from location name
            this.mapTitle = location.name || location.display_name.split(',')[0];
            // Clear previous map bounds and zoom when selecting a new location
            this.mapBounds = null;
            this.mapZoom = null;
            saveToLocalStorage(this.$state);
        },

        updateLocationCoordinates(lat: number, lon: number) {
            if (this.selectedLocation) {
                this.selectedLocation.lat = lat.toString();
                this.selectedLocation.lon = lon.toString();
                saveToLocalStorage(this.$state);
            }
        },

        setMapTitle(title: string) {
            this.mapTitle = title;
            saveToLocalStorage(this.$state);
        },

        setMapSubtitle(subtitle: string) {
            this.mapSubtitle = subtitle;
            saveToLocalStorage(this.$state);
        },

        clearLocation() {
            this.selectedLocation = null;
            this.mapTitle = '';
            this.mapSubtitle = '';
            this.customInfo = '';
            this.mapAspect = '50:70';
            this.mapLandscape = false;
            this.mapBounds = null;
            this.mapZoom = null;
            this.mapWidth = null;
            this.mapHeight = null;
            saveToLocalStorage(this.$state);
        },

        setSelectedStyle(style: string) {
            this.selectedStyle = style;
            saveToLocalStorage(this.$state);
        },

        setSelectedComposition(composition: string) {
            this.selectedComposition = composition;
            saveToLocalStorage(this.$state);
        },

        setMapBounds(bounds: any) {
            this.mapBounds = bounds;
            saveToLocalStorage(this.$state);
        },

        setMapZoom(zoom: number) {
            this.mapZoom = zoom;
            saveToLocalStorage(this.$state);
        },

        setMapDimensions(width: number, height: number) {
            this.mapWidth = width;
            this.mapHeight = height;
            saveToLocalStorage(this.$state);
        },

        setMapData(mapData: any) {
            // Set all map data at once
            if (mapData.bounds) this.mapBounds = mapData.bounds;
            if (mapData.zoom) this.mapZoom = mapData.zoom;
            if (mapData.width) this.mapWidth = mapData.width;
            if (mapData.height) this.mapHeight = mapData.height;
            saveToLocalStorage(this.$state);
        },
    },

    getters: {
        hasSelectedLocation(): boolean {
            return this.selectedLocation !== null;
        },

        locationCoordinates(): { lat: number; lon: number } | null {
            if (!this.selectedLocation) return null;

            return {
                lat: parseFloat(this.selectedLocation.lat),
                lon: parseFloat(this.selectedLocation.lon),
            };
        },

        locationDisplayName(): string {
            return this.selectedLocation?.display_name || '';
        },
    },
});
