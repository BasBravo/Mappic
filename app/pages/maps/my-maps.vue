<script setup>
import { createMapService } from '~~/shared/services/map';
import { styles, compositions } from '~~/data/design';
import { useAuthStore } from '~~/stores/authStore';
import { useMapStore } from '~~/stores/mapStore';
import { capitalize } from '~~/app/utils';

// Services
const mapService = createMapService();

// Store and composables
const authStore = useAuthStore();
const mapStore = useMapStore();
const { t, locale } = useI18n();
const router = useRouter();

// SEO
useHead({
    title: `${t('My Maps')} - Mappic`,
    meta: [{ name: 'description', content: t('View and manage all your created maps.') }],
});

// Reactive data
const data = reactive({
    maps: [],
    filteredMaps: [],
    loading: true,
    filters: {
        quality: 'all',
        style: 'all',
        composition: 'all',
    },
});

// Polling interval for in-progress maps
let statusPollingInterval = null;

// Delete modal
const deleteModal = reactive({
    isOpen: false,
    mapToDelete: null,
});

// Filter options
const qualityOptions = [
    { key: 'all', value: 'all', label: capitalize(t('All')) },
    { key: 'low', value: 'low', label: capitalize(t('small')) },
    { key: 'medium', value: 'medium', label: capitalize(t('medium')) },
    { key: 'high', value: 'high', label: capitalize(t('large')) },
    { key: 'superhigh', value: 'superhigh', label: capitalize(t('high')) },
    { key: 'ultrahigh', value: 'ultrahigh', label: capitalize(t('ultrahigh')) },
];

const styleOptions = [
    { key: 'all', value: 'all', label: capitalize(t('All')) },
    ...styles.map(style => ({
        key: style.key,
        value: style.key,
        label: capitalize(style.value),
    })),
];

const compositionOptions = [
    { key: 'all', value: 'all', label: capitalize(t('All')) },
    ...compositions.map(composition => ({
        key: composition.key,
        value: composition.key,
        label: capitalize(composition.value),
    })),
];

// Computed properties
const isUserAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const hasAnyMaps = computed(() => data.maps.length > 0);
const hasFilteredMaps = computed(() => data.filteredMaps.length > 0);

// Methods
async function getUserMaps() {
    data.loading = true;

    try {
        if (!isUserAuthenticated.value || !user.value?.uid) {
            // For guest users, we could implement localStorage maps or redirect to login
            data.loading = false;
            return;
        }

        const filters = [
            { key: 'created_at', direction: 'desc' },
            { key: 'user', operator: '==', value: `doc:users/${user.value.uid}` },
        ];

        console.log('Filters:', filters);

        const result = await mapService.getMaps({ filters });

        if (result.success) {
            data.maps = result.items;
            filterMaps(data.maps);
            // Start polling if there are in-progress maps
            managePolling();
        }
    } catch (error) {
        console.error('Error getting user maps:', error);
    } finally {
        data.loading = false;
    }
}

function filterMaps(items) {
    let filtered = [...items];

    // Filter by quality
    if (data.filters.quality !== 'all') {
        filtered = filtered.filter(map => map.quality === data.filters.quality);
    }

    // Filter by style
    if (data.filters.style !== 'all') {
        filtered = filtered.filter(map => map.design?.style === data.filters.style);
    }

    // Filter by composition
    if (data.filters.composition !== 'all') {
        filtered = filtered.filter(map => map.design?.composition === data.filters.composition);
    }

    data.filteredMaps = filtered;
    return filtered;
}

function handleMapSelect(uid) {
    navigateTo(`/${locale.value}/maps/${uid}`);
}

function openDeleteModal(map) {
    deleteModal.mapToDelete = map;
    deleteModal.isOpen = true;
}

async function confirmDelete() {
    if (!deleteModal.mapToDelete) return;
    console.log('deleteModal.mapToDelete:::', deleteModal.mapToDelete);

    // try {
    const result = await mapService.delete(deleteModal.mapToDelete.uid);
    console.log('Delete result:::', result);

    if (result.success) {
        // Remove from maps array
        const index = data.maps.findIndex(map => map.uid === deleteModal.mapToDelete.uid);
        if (index > -1) {
            data.maps.splice(index, 1);
            filterMaps(data.maps);
        }
        deleteModal.isOpen = false;
        deleteModal.mapToDelete = null;
    } else {
        alert(t('Error deleting map. Please try again.'));
    }
    // } catch (error) {
    //     console.error('Error deleting map:', error);
    //     alert(t('Error deleting map. Please try again.'));
    // }
}

function cancelDelete() {
    deleteModal.isOpen = false;
    deleteModal.mapToDelete = null;
}

function regenerateMap(map) {
    // Load map data into mapStore to regenerate - following the same pattern as SharedOptions.vue
    if (map.suggestion) {
        // Create location object compatible with mapStore, same as SharedOptions.vue
        const location = {
            lat: map.suggestion.lat?.toString() || '',
            lon: map.suggestion.lon?.toString() || '',
            display_name: map.suggestion.display_name || '',
            name: map.suggestion.name || '',
            place_id: map.suggestion.place_id?.toString() || '',
            osm_type: map.suggestion.osm_type || 'node',
            osm_id: map.suggestion.osm_id?.toString() || '',
            class: map.suggestion.class || 'place',
            type: map.suggestion.type || 'city',
            importance: map.suggestion.importance || 0.5,
            boundingbox: map.suggestion.boundingbox || [],
        };

        // Set location data
        mapStore.selectedLocation = location;
        // Auto-generate title from location name (like the store action does)
        mapStore.mapTitle = location.name || location.display_name.split(',')[0];
    }

    if (map.design) {
        if (map.design.title) mapStore.mapTitle = map.design.title;
        if (map.design.subTitle) mapStore.mapSubtitle = map.design.subTitle;
        if (map.design.style) mapStore.selectedStyle = map.design.style;
        if (map.design.composition) mapStore.selectedComposition = map.design.composition;
        if (map.design.titleSize) mapStore.mapTitleSize = map.design.titleSize;
        if (map.design.subTitleSize) mapStore.mapSubtitleSize = map.design.subTitleSize;
        if (map.design.showInfo !== undefined) mapStore.showInfo = map.design.showInfo;
        if (map.design.customInfo) mapStore.customInfo = map.design.customInfo;
    }

    // Set bounds and zoom directly - fix bounds format from objects to arrays
    if (map.bounds) {
        // Convert bounds from object format to array format if needed
        let formattedBounds = map.bounds;
        if (Array.isArray(map.bounds) && map.bounds.length === 2) {
            // Check if bounds are in object format like { '0': lat, '1': lng }
            if (typeof map.bounds[0] === 'object' && map.bounds[0].hasOwnProperty('0')) {
                formattedBounds = [
                    [map.bounds[0]['0'], map.bounds[0]['1']],
                    [map.bounds[1]['0'], map.bounds[1]['1']],
                ];
            }
        }
        mapStore.mapBounds = formattedBounds;
    }

    if (map.zoom) {
        mapStore.mapZoom = map.zoom;
    }

    // Set dimensions
    if (map.width && map.height) {
        mapStore.mapWidth = map.width;
        mapStore.mapHeight = map.height;

        // Also calculate aspect ratio from dimensions
        const PPI = 300;
        const widthCm = Math.round((map.width / PPI) * 2.54);
        const heightCm = Math.round((map.height / PPI) * 2.54);
        mapStore.mapAspect = `${widthCm}:${heightCm}`;
        mapStore.mapLandscape = map.format === 'landscape';
    }

    // Navigate to generate page
    router.push('/maps/generate');
}

// Check status of in-progress maps
async function checkInProgressMaps() {
    const inProgressMaps = data.maps.filter(map => map.in_progress);

    if (inProgressMaps.length === 0) {
        return; // No maps to check
    }

    try {
        // Check each in-progress map
        for (const map of inProgressMaps) {
            // Get map with deep references to ensure we have image data
            const result = await mapService.getMap(map.uid, { deep: true });

            if (result.success && result.data) {
                const updatedMap = result.data;

                // Check if map is no longer in progress
                if (!updatedMap.in_progress) {
                    // Find the map in our local array and update it
                    const index = data.maps.findIndex(m => m.uid === map.uid);
                    if (index > -1) {
                        // Completely replace the map data to ensure all new fields are included
                        data.maps[index] = updatedMap;

                        // Add a timestamp to force re-rendering of components
                        data.maps[index]._refreshKey = Date.now();

                        // Re-filter maps to update the display
                        filterMaps(data.maps);

                        console.log(`Map ${map.uid} completed processing with image data:`, updatedMap._references);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking in-progress maps:', error);
    }
}

// Start/stop polling based on whether there are in-progress maps
function managePolling() {
    const hasInProgressMaps = data.maps.some(map => map.in_progress);

    if (hasInProgressMaps && !statusPollingInterval) {
        // Start polling
        statusPollingInterval = setInterval(checkInProgressMaps, 20000); // 20 seconds
        console.log('Started polling for in-progress maps');
    } else if (!hasInProgressMaps && statusPollingInterval) {
        // Stop polling
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
        console.log('Stopped polling - no in-progress maps');
    }
}

// Watchers
watch(
    () => data.filters,
    () => {
        filterMaps(data.maps);
    },
    { deep: true }
);

// Watch for changes in maps to manage polling
watch(
    () => data.maps,
    () => {
        managePolling();
    },
    { deep: true }
);

// Lifecycle
onMounted(async () => {
    await getUserMaps();
});

onUnmounted(() => {
    // Clean up polling interval when component is unmounted
    if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
    }
});
</script>

<template>
    <div class="min-h-[calc(100vh-4rem)] flex justify-center">
        <!-- Delete confirmation modal -->
        <UModal v-model:open="deleteModal.isOpen" @close="cancelDelete" :ui="{ content: 'max-w-sm' }">
            <template #content>
                <div class="p-6 space-y-4">
                    <div class="flex flex-col text-center gap-4 pb-4">
                        <p class="text-gray-900 text-balance mb-2">
                            {{ $t('Are you sure you want to delete this map?') }}
                        </p>
                        <p v-if="deleteModal.mapToDelete" class="text-lg text-gray-600">
                            <strong>{{ deleteModal.mapToDelete.design?.title || $t('Untitled Map') }}</strong>
                        </p>
                        <p class="text-xs text-center w-full text-red-600">
                            {{ $t('This action cannot be undone.') }}
                        </p>
                    </div>
                    <div class="w-full flex justify-between gap-3">
                        <UButton variant="soft" size="xl" class="w-full justify-center" @click="cancelDelete">
                            {{ $t('Cancel') }}
                        </UButton>
                        <UButton color="error" variant="solid" size="xl" class="w-full justify-center" @click="confirmDelete">
                            {{ $t('Delete') }}
                        </UButton>
                    </div>
                </div>
            </template>
        </UModal>

        <div v-if="data.loading" class="fixed inset-0 z-50 flex items-center justify-center">
            <Loader />
        </div>

        <div v-else-if="!isUserAuthenticated" class="w-full flex items-center justify-center my-auto py-8">
            <CardComposition
                image-src="/opendoodles/clumsy.svg"
                :title="$t('Login Required')"
                :description="$t('Please log in to view your maps.')">
                <UButton size="xl" block :to="'/auth/login'">
                    {{ $t('Login') }}
                </UButton>
            </CardComposition>
        </div>

        <!-- Content when authenticated and loaded -->

        <!-- No maps state -->
        <template v-else>
            <div v-if="!hasAnyMaps" class="w-full h-full flex items-center justify-center p-6">
                <CardComposition
                    image-src="/opendoodles/unboxing.svg"
                    :title="$t('No Maps Yet')"
                    :description="$t('Start creating beautiful maps to see them here.')">
                    <UButton size="xl" :to="'/maps/editor'">
                        {{ $t('Create your first map') }}
                    </UButton>
                </CardComposition>
            </div>

            <!-- Maps content -->
            <div v-else class="flex flex-col pb-10 gap-10 w-full">
                <EffectGlass class="relative mt-20 z-10 p-6 rounded-3xl" :displace="2">
                    <div class="flex flex-col lg:flex-row justify-between w-full">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <UFormField :label="$t('Quality')">
                                    <USelect
                                        v-model="data.filters.quality"
                                        color="neutral"
                                        class="w-full lg:w-40"
                                        :items="qualityOptions"
                                        value-key="key"
                                        text-key="label" />
                                </UFormField>
                            </div>
                            <div>
                                <UFormField :label="$t('Style')">
                                    <USelect
                                        v-model="data.filters.style"
                                        color="neutral"
                                        class="w-full lg:w-40"
                                        :items="styleOptions"
                                        value-key="key"
                                        text-key="label" />
                                </UFormField>
                            </div>
                            <div>
                                <UFormField :label="$t('Composition')">
                                    <USelect
                                        v-model="data.filters.composition"
                                        color="neutral"
                                        class="w-full lg:w-40"
                                        :items="compositionOptions"
                                        value-key="key"
                                        text-key="label" />
                                </UFormField>
                            </div>
                        </div>

                        <div class="flex items-center gap-4 pt-6">
                            <div
                                v-if="data.filters.quality !== 'all' || data.filters.style !== 'all' || data.filters.composition !== 'all'">
                                <UButton
                                    color="neutral"
                                    variant="outline"
                                    @click="data.filters = { quality: 'all', style: 'all', composition: 'all' }">
                                    {{ $t('Clear Filters') }}
                                </UButton>
                            </div>
                            <div class="text-sm text-gray-600">{{ data.filteredMaps.length }} {{ $t('maps found') }}</div>
                        </div>
                    </div>
                </EffectGlass>

                <!-- No filtered results -->
                <div v-if="!hasFilteredMaps" class="flex flex-col w-full items-center justify-center py-20">
                    <span class="text-lg">{{ $t('No maps found with the current filters.') }}</span>
                </div>

                <!-- Maps grid -->
                <div v-else>
                    <div class="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-20 mb-8 md:p-4">
                        <MapsItem
                            v-for="map in data.filteredMaps"
                            :key="map.uid"
                            :map="map"
                            @delete="openDeleteModal"
                            @regenerate="regenerateMap"
                            @select="handleMapSelect" />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
