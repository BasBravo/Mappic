<script setup>
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { useMapStore } from '~~/stores/mapStore';
import { createMapService } from '~~/shared/services/map';
import { styles } from '~~/data/design';

// Props
const props = defineProps({
    editable: {
        type: Boolean,
        default: true,
    },
    animation: {
        type: Boolean,
        default: true,
    },
    minWidth: {
        type: Number,
        default: 700,
    },
    minHeight: {
        type: Number,
        default: 1000,
    },
});

// Store
const mapStore = useMapStore();

// Services
const mapService = createMapService();

// Runtime config
const config = useRuntimeConfig();

// Component config
const mapId = `mappic-map-${Math.random().toString(36).substr(2, 9)}`;
const design = reactive({
    title: '',
    subTitle: '',
    showInfo: true,
    aspect: '5:7',
    landscape: false,
    composition: 'classy',
});

// Refs
const frameArea = ref(null);
const map = ref(null);

// Reactive data
const currentZoom = ref(11);
const frameSizes = ref('');
const mapSizes = ref('');
const isSmallScreen = ref(false);
const ready = ref(false);
const mapVisible = ref(false);
const stylesLoading = ref(true);
const stylesLoaded = ref(false);

// Timeout references for cleanup
let resizeTimeout;

// Initialize Mapbox
if (config.public.mapbox?.apiKey) {
    mapboxgl.accessToken = config.public.mapbox.apiKey;
    // Disable telemetry to prevent content blocker errors
    mapboxgl.telemetry = false;
} else {
    console.warn('Mapbox API key not found');
}

// Computed
const mapCenter = computed(() => {
    if (mapStore.selectedLocation?.lat && mapStore.selectedLocation?.lon) {
        return [parseFloat(mapStore.selectedLocation.lon), parseFloat(mapStore.selectedLocation.lat)];
    }
    return [0, 0];
});

const mapStyle = computed(() => {
    const style = styles.find(s => s.key === mapStore.selectedStyle);
    return style || styles.find(s => s.key === 'minimal');
});

// Computed property for dimensions in pixels based on aspect ratio (cm to px conversion)
const mapDimensionsInPixels = computed(() => {
    if (!mapStore.mapAspect) return { width: 0, height: 0 };

    // Extract width and height from aspect ratio (e.g., "50:70" -> [50, 70])
    const [widthCm, heightCm] = mapStore.mapAspect.split(':').map(Number);

    // Standard print resolution: 300 DPI (dots per inch)
    // 1 inch = 2.54 cm
    // So: pixels = cm * (300 / 2.54) ≈ cm * 118.11
    const cmToPixels = 300 / 2.54;

    const widthPx = Math.round(widthCm * cmToPixels);
    const heightPx = Math.round(heightCm * cmToPixels);

    return {
        width: widthPx,
        height: heightPx,
        widthCm,
        heightCm,
    };
});

// Computed property for dynamic font sizes
const dynamicFontSizes = computed(() => {
    // Base values from the current CSS (these are the "normal" sizes at 50%)
    const titleBaseSize = 14; // Base cqw value for title (from classy composition)
    const subtitleBaseSize = 2; // Base cqw value for subtitle (from classy composition)

    // Calculate multiplier from slider value (0-100) to scale (0.3-1.7)
    // 0 = 30% of original, 50 = 100% of original, 100 = 170% of original
    const titleMultiplier = 0.3 + (mapStore.mapTitleSize / 100) * 1.4;
    const subtitleMultiplier = 0.3 + (mapStore.mapSubtitleSize / 100) * 1.4;

    return {
        titleSize: (titleBaseSize * titleMultiplier).toFixed(1),
        subtitleSize: (subtitleBaseSize * subtitleMultiplier).toFixed(1),
    };
});

// Sync design with store data
watchEffect(() => {
    design.title = mapStore.mapTitle || '';
    design.subTitle = mapStore.mapSubtitle || '';
    design.composition = mapStore.selectedComposition;
    design.showInfo = mapStore.showInfo;
    const newAspect = mapStore.mapAspect || '5:7';
    if (design.aspect !== newAspect) {
        design.aspect = newAspect;
    }
    design.landscape = mapStore.mapLandscape || false;
});

// Methods
const initializeMap = () => {
    if (!frameArea.value) {
        return;
    }

    // Check if container exists in DOM
    const containerElement = document.getElementById(mapId);
    if (!containerElement) {
        return;
    }

    // Clean up any existing map instance
    if (map.value) {
        map.value.remove();
        map.value = null;
    }

    const zoomLevels = getZoomLevels();

    try {
        map.value = new mapboxgl.Map({
            container: mapId,
            center: mapCenter.value,
            zoom: mapStore.mapZoom || currentZoom.value,
            style: `mapbox://styles/basbravo/${mapStyle.value.id}`,
            scrollZoom: false, // Disable mouse wheel zoom
        });
    } catch (error) {
        console.error('Error initializing map:', error);
        return;
    }

    // Restore bounds if available for exact position recovery
    map.value.on('load', () => {
        // Resize map to ensure it fills the container
        nextTick(() => {
            if (map.value) {
                map.value.resize();
            }
        });

        if (mapStore.mapBounds && Array.isArray(mapStore.mapBounds) && mapStore.mapBounds.length === 2) {
            try {
                const bounds = mapStore.mapBounds;
                const sw = [bounds[0][0], bounds[0][1]];
                const ne = [bounds[1][0], bounds[1][1]];
                map.value.fitBounds([sw, ne], { padding: 20 });
            } catch (error) {
                console.error('Error restoring bounds:', error);
            }
        }
    });

    // Simple event listeners like the original
    map.value.on('zoom', () => {
        currentZoom.value = map.value.getZoom();
        // Update store immediately for reactive display
        mapStore.setMapZoom(map.value.getZoom());
    });

    // Save position only when interaction is completely finished (if editable)
    if (props.editable) {
        let interactionTimeout;
        let isInteracting = false;

        // Track when interaction starts
        map.value.on('movestart', () => {
            isInteracting = true;
            clearTimeout(interactionTimeout);
        });

        map.value.on('zoomstart', () => {
            isInteracting = true;
            clearTimeout(interactionTimeout);
        });

        // Track when interaction might be ending
        const handleInteractionEnd = () => {
            if (!isInteracting || !map.value) return;

            clearTimeout(interactionTimeout);
            interactionTimeout = setTimeout(() => {
                // Only save if we're really done (no more events for 500ms)
                if (!map.value) return;

                const center = map.value.getCenter();
                const bounds = map.value.getBounds();

                mapStore.updateLocationCoordinates(center.lat, center.lng);
                mapStore.setMapZoom(map.value.getZoom());

                const boundsArray = [
                    [bounds.getWest(), bounds.getSouth()],
                    [bounds.getEast(), bounds.getNorth()],
                ];
                mapStore.setMapBounds(boundsArray);

                isInteracting = false;
            }, 500);
        };

        map.value.on('moveend', handleInteractionEnd);
        map.value.on('zoomend', handleInteractionEnd);
    }

    // Set zoom limits
    map.value.setMinZoom(zoomLevels.min);
    map.value.setMaxZoom(zoomLevels.max);

    // Force resize after initialization to ensure proper rendering
    nextTick(() => {
        if (map.value) {
            map.value.resize();
        }
    });

    ready.value = true;
    mapVisible.value = true;
};

const getZoomLevels = () => {
    const isMobile = window.innerWidth < 1024;
    return {
        default: isMobile ? 9 : 11,
        min: 3,
        max: isMobile ? 11 : 15,
    };
};

const zoomIn = () => {
    if (map.value) map.value.zoomIn();
};

const zoomOut = () => {
    if (map.value) map.value.zoomOut();
};

const flyToLocation = (coordinates, zoom = 11) => {
    if (map.value) {
        map.value.flyTo({
            center: coordinates,
            zoom: zoom,
            essential: true,
        });
    }
};

const getMapInfo = () => {
    if (!map.value) return null;

    try {
        const center = map.value.getCenter();
        const bounds = map.value.getBounds();
        const info = {
            center: { lat: center.lat, lng: center.lng },
            zoom: map.value.getZoom(),
            bounds: bounds.toArray(),
        };

        // Store is automatically updated when interaction ends

        return info;
    } catch (error) {
        console.error('Error getting map info:', error);
        return null;
    }
};

const calculateFrameSize = () => {
    isSmallScreen.value = window.innerWidth < 1024;

    if (!frameArea.value) {
        frameSizes.value = '';
        return;
    }

    // For non-editable maps (like in map-generate), maintain aspect ratio
    if (!props.editable) {
        const [widthRatio, heightRatio] = design.aspect.split(':').map(Number);
        const containerRect = frameArea.value.getBoundingClientRect();

        // Calculate sizes respecting aspect ratio
        let sizes = mapService.calculateSizes(Math.min(containerRect.width, containerRect.height), design.aspect);

        // Fit within container while maintaining aspect ratio
        if (sizes.width > containerRect.width) {
            sizes.width = containerRect.width;
            sizes.height = (sizes.width * heightRatio) / widthRatio;
        }

        if (sizes.height > containerRect.height) {
            sizes.height = containerRect.height;
            sizes.width = (sizes.height * widthRatio) / heightRatio;
        }

        // Apply minimum sizes from props and landscape orientation for non-editable maps too
        const minWidth = props.minWidth;
        const minHeight = props.minHeight;

        if (design.landscape) {
            const finalWidth = Math.max(sizes.height, minWidth);
            const finalHeight = Math.max(sizes.width, minHeight);
            mapSizes.value = {
                width: finalWidth,
                height: finalHeight,
            };
            frameSizes.value = `min-width: ${minWidth}px; min-height: ${minHeight}px; width: ${finalWidth.toFixed(
                0
            )}px; height: ${finalHeight.toFixed(0)}px;`;
        } else {
            const finalWidth = Math.max(sizes.width, minWidth);
            const finalHeight = Math.max(sizes.height, minHeight);
            mapSizes.value = {
                width: finalWidth,
                height: finalHeight,
            };
            frameSizes.value = `min-width: ${minWidth}px; min-height: ${minHeight}px; width: ${finalWidth.toFixed(
                0
            )}px; height: ${finalHeight.toFixed(0)}px;`;
        }
        return;
    }

    const [widthRatio, heightRatio] = design.aspect.split(':').map(Number);
    const padding = 200; //isSmallScreen.value ? 250 : 100;
    const maxHeight = window.innerHeight - padding;
    const containerRect = frameArea.value.getBoundingClientRect();

    let sizes = mapService.calculateSizes(containerRect.width * 0.8, design.aspect);

    // Adjust if too tall
    if (sizes.height > maxHeight) {
        sizes.height = maxHeight;
        sizes.width = (sizes.height * widthRatio) / heightRatio;
        console.log('Adjusted for max height:', sizes);
    }

    // Apply minimum sizes from props
    const minWidth = props.minWidth;
    const minHeight = props.minHeight;

    // Apply landscape orientation with minimum size enforcement
    if (design.landscape) {
        const finalWidth = Math.max(sizes.height, minWidth);
        const finalHeight = Math.max(sizes.width, minHeight);
        mapSizes.value = {
            width: finalWidth,
            height: finalHeight,
        };
        frameSizes.value = `min-width: ${minWidth}px; min-height: ${minHeight}px; width: ${finalWidth.toFixed(
            0
        )}px; height: ${finalHeight.toFixed(0)}px;`;
    } else {
        const finalWidth = Math.max(sizes.width, minWidth);
        const finalHeight = Math.max(sizes.height, minHeight);
        mapSizes.value = {
            width: finalWidth,
            height: finalHeight,
        };
        frameSizes.value = `min-width: ${minWidth}px; min-height: ${minHeight}px; width: ${finalWidth.toFixed(
            0
        )}px; height: ${finalHeight.toFixed(0)}px;`;
    }
};

// Watchers
watch(
    () => mapStore.selectedLocation,
    newLocation => {
        if (newLocation?.lat && newLocation?.lon && map.value && ready.value) {
            const coordinates = [parseFloat(newLocation.lon), parseFloat(newLocation.lat)];
            flyToLocation(coordinates, currentZoom.value);
        }
    },
    { deep: true }
);

watch(
    () => mapStore.selectedStyle,
    newStyle => {
        if (map.value && ready.value) {
            const style = styles.find(s => s.key === newStyle);
            if (style) {
                map.value.setStyle(`mapbox://styles/basbravo/${style.id}`);
            }
        }
    }
);

watch(
    () => design.aspect,
    () => {
        if (ready.value) {
            calculateFrameSize();
            nextTick(() => {
                if (map.value) map.value.resize();
            });
        }
    }
);

watch(
    () => design.landscape,
    () => {
        if (ready.value) {
            calculateFrameSize();
            nextTick(() => {
                if (map.value) map.value.resize();
            });
        }
    }
);

watch(
    () => mapStore.selectedComposition,
    newComposition => {
        design.composition = newComposition;
    }
);

watch(
    () => mapStore.mapAspect,
    newAspect => {
        console.log('mapStore.mapAspect changed:', newAspect);
        if (ready.value) {
            calculateFrameSize();
            nextTick(() => {
                if (map.value) {
                    map.value.resize();
                    console.log('Map resized for aspect:', newAspect);
                }
            });
        }
    }
);

watch(
    () => mapStore.mapLandscape,
    () => {
        calculateFrameSize();
        nextTick(() => {
            if (map.value) map.value.resize();
        });
    }
);

// Watch for font size changes to debug
watch(
    () => [mapStore.mapTitleSize, mapStore.mapSubtitleSize],
    ([newTitleSize, newSubtitleSize]) => {
        console.log('Font sizes changed:', {
            titleSize: newTitleSize,
            subtitleSize: newSubtitleSize,
            computed: dynamicFontSizes.value,
        });
    }
);

// Event listeners with throttling
const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        calculateFrameSize();
        nextTick(() => {
            if (map.value) map.value.resize();
        });
    }, 100);
};

// Load map styles from server with scoping
const loadMapStyles = async () => {
    stylesLoading.value = true;
    stylesLoaded.value = false;

    try {
        const url = config.public.functionsUrl + '/mappic/styles';

        // Check if styles are already loaded
        const existingLink = document.querySelector(`link[href="${url}"]`);
        if (existingLink) {
            stylesLoading.value = false;
            stylesLoaded.value = true;
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;

            link.onload = () => {
                stylesLoading.value = false;
                stylesLoaded.value = true;
                // Resize map when styles are loaded
                nextTick(() => {
                    if (map.value) {
                        map.value.resize();
                    }
                });
                resolve(void 0);
            };

            link.onerror = () => {
                stylesLoading.value = false;
                stylesLoaded.value = false;
                reject(new Error(`Failed to load map styles from ${url}`));
            };

            document.head.appendChild(link);
        });
    } catch (error) {
        stylesLoading.value = false;
        stylesLoaded.value = false;
        console.error('Error loading map styles:', error);
        throw error;
    }
};

// Store reference to the style element for cleanup
let mapStyleElement = null;

onBeforeMount(async () => {
    // Ensure mapbox is available globally
    if (!window.mapboxgl) {
        window.mapboxgl = mapboxgl;
    }

    // Load map styles first
    try {
        await loadMapStyles();
        // Store reference to the style element for potential cleanup
        mapStyleElement = document.querySelector('style[data-mappic-styles]');
    } catch (error) {
        console.error('Failed to load map styles:', error);
    }
});

// Lifecycle
onMounted(async () => {
    calculateFrameSize();

    // Wait for DOM to be fully rendered before initializing map
    await nextTick();

    setTimeout(() => {
        initializeMap();

        // Additional resize after a short delay to ensure container is stable
        setTimeout(() => {
            if (map.value) {
                map.value.resize();
            }
        }, 300);
    }, 150);

    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);

    // Clear all timeouts
    if (resizeTimeout) clearTimeout(resizeTimeout);

    if (map.value) {
        map.value.remove();
        map.value = null;
    }
});

// Expose methods
defineExpose({
    zoomIn,
    zoomOut,
    flyToLocation,
    getMapInfo,
    design,
    mapSizes,
});
</script>

<template>
    <!-- Loading State -->
    <div
        v-if="stylesLoading"
        class="bg-white inset-0 z-50 flex items-center justify-center rounded-4xl border-2 border-black/10"
        :style="frameSizes">
        <div class="text-center">
            <Loader color="#374151" />
        </div>
    </div>

    <div
        v-show="!stylesLoading"
        ref="frameArea"
        class="mappic-render min-h-[calc(100dvh-4rem)] w-full relative flex justify-center items-center gap-4 pb-20"
        :class="[`theme_base theme_${mapStyle.key}`]">
        <div class="flex flex-col gap-3">
            <div class="gap-2 flex md:justify-center text-xs text-black/40 w-80 truncate md:w-full">
                <span class="uppercase">{{ $t(mapStore.selectedStyle) }}</span>
                <span>|</span>
                <span class="uppercase">{{ $t(mapStore.selectedComposition) }}</span>
                <span>|</span>
                <span class="uppercase">
                    {{ mapDimensionsInPixels.widthCm }}×{{ mapDimensionsInPixels.heightCm }}cm ({{ mapDimensionsInPixels.width }}×{{
                        mapDimensionsInPixels.height
                    }}
                    px)
                </span>
                <span>|</span>
                <span class="uppercase">{{ $t('zoom') }}</span>
                <span>{{ mapStore.mapZoom?.toFixed(2) || 'N/A' }}</span>
            </div>
            <!-- Map Frame -->
            <div
                class="flex h-full rounded-4xl border-2 border-black/10 bg-white relative z-0 overflow-hidden"
                :style="frameSizes"
                :class="[editable ? '' : 'pointer-events-none', stylesLoading ? 'opacity-0' : 'opacity-100']"
                style="transition: opacity 0.3s ease">
                <div class="preview flex w-full h-full bg-white dark:bg-black relative z-20">
                    <!-- Design Composition -->
                    <div
                        class="w-full h-full q_low"
                        :class="[`composition_${design.composition}`]"
                        :style="{
                            '--title-font-size': dynamicFontSizes.titleSize + 'cqw',
                            '--title-font-size-landascape': dynamicFontSizes.titleSizeLandscape + 'cqw',
                            '--subtitle-font-size': dynamicFontSizes.subtitleSize + 'cqw',
                        }">
                        <!-- Safe Area (hidden by default) -->
                        <div class="safe-area">
                            <div class="inside one">
                                <div class="inside two">
                                    <div class="inside three"></div>
                                </div>
                            </div>
                        </div>

                        <img
                            v-if="mapStyle.key != 'picasso' && design.composition != 'clean'"
                            :src="`/bg/${mapStyle.key}.png`"
                            class="absolute z-10 inset-0 w-full h-full pointer-events-none" />

                        <!-- Map Container -->
                        <div :id="mapId" class="relative flex w-full h-full" />

                        <!-- Text Overlay -->
                        <div class="relative z-30">
                            <div class="text-box pointer-events-none">
                                <div class="title">
                                    <span :data-text="design.title">{{ design.title }}</span>
                                </div>
                                <div class="second-area">
                                    <div v-if="design.subTitle" class="subtitle">
                                        <span>{{ design.subTitle || '' }}</span>
                                    </div>
                                    <div v-if="design.showInfo && mapStore.selectedLocation" class="info">
                                        <div v-if="mapStore.customInfo" class="coos text-center">
                                            <span style="white-space: pre-line">{{ mapStore.customInfo }}</span>
                                        </div>
                                        <template v-else>
                                            <div class="coos">
                                                <span>
                                                    Lat.{{ parseFloat(mapStore.selectedLocation.lat).toFixed(4) }} - Lon.{{
                                                        parseFloat(mapStore.selectedLocation.lon).toFixed(4)
                                                    }}
                                                </span>
                                            </div>
                                            <div v-if="design.showInfo" class="address">
                                                <span>{{ mapStore.selectedLocation.display_name || '' }}</span>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Hide default mapbox controls */
:deep(.mapboxgl-ctrl) {
    display: none !important;
}

/* Optimize map performance */
:deep(.mapboxgl-map) {
    outline: none;
    -webkit-tap-highlight-color: transparent;
}

:deep(.mapboxgl-canvas-container) {
    cursor: inherit;
}

:deep(.mapboxgl-canvas) {
    outline: none;
    -webkit-tap-highlight-color: transparent;
}
</style>
