<script setup>
import { createMapService } from '~~/shared/services/map';

// Route params
const route = useRoute();
const uid = route.params.uid;

// Services
const mapService = createMapService();

// Reactive data
const mapData = ref(null);
const loading = ref(true);
const error = ref(false);
const imageUrl = ref('');

// Get map data
async function getMapData() {
    try {
        loading.value = true;
        error.value = false;

        const result = await mapService.getMap(uid, { deep: true });

        if (result.success) {
            mapData.value = result.data;
            imageUrl.value = result.data?._references?.file_map_resized?.url || result.data?._references?.file_map?.url;
        } else {
            error.value = true;
        }
    } catch (err) {
        console.error('Error fetching map data:', err);
        error.value = true;
    } finally {
        loading.value = false;
    }
}

// Current URL for sharing
const currentUrl = ref('');

// SEO Meta tags
const seoTitle = computed(() => {
    if (!mapData.value) return 'Map | Mappic';
    return `${mapData.value.design?.title} - Beautiful Map | Mappic`;
});

const seoDescription = computed(() => {
    if (!mapData.value) return 'Explore beautiful maps created with Mappic';
    const location = mapData.value.location?.display_name || 'Unknown location';
    return `Explore this beautiful map of ${location}. Created with Mappic - Create high-resolution maps in seconds.`;
});

const seoImage = computed(() => {
    return imageUrl.value || '/default-map-preview.jpg';
});

const mapDimensionsInPixels = computed(() => {
    // Extract width and height from aspect ratio (e.g., "50:70" -> [50, 70])
    const widthPx = parseInt(mapData.value?.width);
    const heightPx = parseInt(mapData.value?.height);

    // Standard print resolution: 300 DPI (dots per inch)
    // 1 inch = 2.54 cm
    // So: pixels = cm * (300 / 2.54) ≈ cm * 118.11
    const cmToPixels = 300 / 2.54;

    const widthCm = Math.round(widthPx / cmToPixels);
    const heightCm = Math.round(heightPx / cmToPixels);

    return {
        widthCm,
        heightCm,
        widthPx,
        heightPx,
    };
});

// Set current URL on mount
onMounted(() => {
    currentUrl.value = window.location.href;
    getMapData();
});

// Dynamic meta tags
useHead({
    title: seoTitle,
    meta: [
        { name: 'description', content: seoDescription },
        { name: 'keywords', content: 'map, mappic, city map, beautiful maps, high resolution maps' },

        // Open Graph
        { property: 'og:title', content: seoTitle },
        { property: 'og:description', content: seoDescription },
        { property: 'og:image', content: seoImage },
        { property: 'og:url', content: currentUrl },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Mappic' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: seoTitle },
        { name: 'twitter:description', content: seoDescription },
        { name: 'twitter:image', content: seoImage },

        // Additional SEO
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'Mappic' },
    ],
    link: [{ rel: 'canonical', href: currentUrl }],
});
</script>

<template>
    <div class="relative w-full min-h-[calc(100dvh-4rem)] flex justify-center items-center">
        <div class="fixed left-0 md:left-20 right-0 flex justify-center bottom-4 px-6 py-3 z-10">
            <MapSharedOptions :uid="uid" />
        </div>

        <div v-if="mapData" class="flex flex-col gap-3 w-full max-w-[700px] my-auto py-20">
            <div class="gap-2 flex md:justify-center text-xs text-black/40 w-80 truncate md:w-full">
                <span class="uppercase">{{ $t(mapData.design.style) }}</span>
                <span>|</span>
                <span class="uppercase">{{ $t(mapData.design.composition) }}</span>
                <span>|</span>
                <span class="uppercase">
                    {{ mapDimensionsInPixels.widthCm }}×{{ mapDimensionsInPixels.heightCm }}cm ({{ mapDimensionsInPixels.widthPx }}×{{
                        mapDimensionsInPixels.heightPx
                    }}
                    px)
                </span>
                <span>|</span>
            </div>
            <MapStatic :uid="uid" :interactive="false" />
        </div>
        <!-- TODO: Show map info -->
        <div v-if="mapData" class="hidden gap-x-2 gap-y-1">
            <div class="flex items-center gap-1 text-xs">
                <span class="text-gray-500">{{ $t('Quality') }}:</span>
                <span class="font-mono font-bold uppercase">
                    {{ mapData.quality?.toUpperCase() || '-' }}
                </span>
            </div>
            <div class="flex items-center gap-1 text-xs">
                <span class="text-gray-500">{{ $t('Style') }}:</span>
                <span class="font-mono font-bold uppercase">
                    {{ mapData.design?.style || '-' }}
                </span>
            </div>
            <div v-if="mapData.in_progress" class="flex items-center gap-1 text-xs">
                <span class="text-gray-500">{{ $t('Status') }}:</span>
                <span class="font-mono font-bold uppercase">{{ $t('Processing') }}...</span>
            </div>
            <div v-if="mapData.is_purchased_copy" class="flex items-center gap-1 text-xs">
                <span class="text-gray-500">{{ $t('Origin') }}:</span>
                <span class="font-mono font-bold uppercase">{{ $t('Copy') }}</span>
            </div>
            <!-- votes -->
            <div class="flex items-center gap-1 text-xs">
                <span class="text-gray-500">{{ $t('Votes') }}:</span>
                <span class="font-mono font-bold uppercase">
                    {{ mapData.votes || 0 }}
                </span>
            </div>
            <!-- Dimensions -->
            <div class="flex items-center gap-1 text-xs">
                <span class="text-gray-500">{{ $t('Dimensions') }}:</span>
                <span class="font-mono font-bold">
                    {{ parseFloat(mapData.width).toFixed(0) }} x {{ parseFloat(mapData.height).toFixed(0) }} px
                </span>
            </div>
        </div>
    </div>
</template>
