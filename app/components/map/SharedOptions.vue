<script setup>
import { useAuthStore } from '~~/stores/authStore';
import { useMapStore } from '~~/stores/mapStore';
import { createMapService } from '~~/shared/services/map';

// Props
const props = defineProps({
    uid: {
        type: String,
        required: true,
    },
});

// Services
const mapService = createMapService();
const authStore = useAuthStore();

// Reactive data
const mapData = ref(null);
const loading = ref(false);
const hasVoted = ref(false);
const voteCount = ref(-1);
const openModalExit = ref(false);
const isDownloading = ref(false);
const hasDownloaded = ref(false);
const heartExplode = ref(false);

// Current URL for sharing
const currentUrl = ref('');

// Computed properties
const isOwner = computed(() => {
    const currentUser = authStore.user;
    if (!currentUser || !mapData.value) return false;

    // Check if the current user is the owner of the map
    const mapUser = mapData.value.user;
    if (typeof mapUser === 'string') {
        // If user is a string reference like "users/uid"
        return mapUser === `users/${currentUser.uid}` || mapUser === `doc:users/${currentUser.uid}`;
    } else if (mapUser && mapUser.uid) {
        // If user is an object with uid
        return mapUser.uid === currentUser.uid;
    }

    return false;
});

// Get map data
async function getMapData() {
    try {
        loading.value = true;
        const result = await mapService.getMap(props.uid, { deep: true });
        if (result.success) {
            mapData.value = result.data;
            voteCount.value = result.data.votes || 0;

            // Check if current user has already voted
            const currentUser = authStore.user;
            if (currentUser?.uid) {
                hasVoted.value = await mapService.hasUserVoted(props.uid, currentUser.uid);
            } else {
                hasVoted.value = false;
            }
        }
    } catch (err) {
        console.error('Error fetching map data:', err);
    } finally {
        loading.value = false;
    }
}

// Vote functionality
const toggleVote = async () => {
    const currentUser = authStore.user;

    // Check if user is authenticated
    if (!currentUser?.uid) {
        // Redirect to login or show login modal
        navigateTo('/auth/login');
        return;
    }

    // Prevent voting on own maps
    if (isOwner.value) {
        alert('You cannot vote on your own maps');
        return;
    }

    try {
        loading.value = true;

        // Trigger heart explosion effect
        heartExplode.value = true;
        setTimeout(() => {
            heartExplode.value = false;
        }, 600);

        if (hasVoted.value) {
            // Remove vote
            const result = await mapService.removeVote(props.uid, currentUser.uid);
            if (result.success) {
                voteCount.value = Math.max(0, voteCount.value - 1);
                hasVoted.value = false;
            } else {
                console.error('Error removing vote:', result.message);
                alert('Error removing vote. Please try again.');
            }
        } else {
            // Add vote
            const result = await mapService.addVote(props.uid, currentUser.uid);
            if (result.success) {
                voteCount.value++;
                hasVoted.value = true;
            } else {
                console.error('Error adding vote:', result.message);
                alert('Error adding vote. Please try again.');
            }
        }
    } catch (error) {
        console.error('Error toggling vote:', error);
        alert('Error processing vote. Please try again.');
    } finally {
        loading.value = false;
    }
};

// Social sharing functions
const shareOnX = () => {
    const text = encodeURIComponent(`Check out this beautiful map: ${mapData.value?.design?.title || 'Untitled Map'}`);
    const url = encodeURIComponent(currentUrl.value);
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank');
};

const shareOnFacebook = () => {
    const url = encodeURIComponent(currentUrl.value);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
};

const shareOnLinkedIn = () => {
    const url = encodeURIComponent(currentUrl.value);
    const title = encodeURIComponent(mapData.value?.design?.title || 'Untitled Map');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
};

const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this beautiful map: ${mapData.value?.design?.title || 'Untitled Map'} ${currentUrl.value}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
};

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(currentUrl.value);
    } catch (err) {
        console.error('Failed to copy URL:', err);
    }
};

// Edit map functionality
const editMapCopy = async () => {
    if (!mapData.value) {
        console.error('No map data available to copy');
        return;
    }

    // Get the map store
    const mapStore = useMapStore();

    try {
        // Extract location data from the map suggestion
        const suggestion = mapData.value.suggestion;

        if (suggestion) {
            // Create location object compatible with mapStore
            // The suggestion object already has the needed structure
            const location = {
                lat: suggestion.lat?.toString() || '',
                lon: suggestion.lon?.toString() || '',
                display_name: suggestion.display_name || '',
                name: suggestion.name || '',
                place_id: suggestion.place_id?.toString() || '',
                osm_type: suggestion.osm_type || 'node',
                osm_id: suggestion.osm_id?.toString() || '',
                class: suggestion.class || 'place',
                type: suggestion.type || 'city',
                importance: suggestion.importance || 0.5,
                boundingbox: suggestion.boundingbox || [],
            };

            // Set location in store
            mapStore.setSelectedLocation(location);
        } else {
            console.error('No suggestion data found in mapData');
        }

        // Set map design data
        if (mapData.value.design) {
            mapStore.setMapTitle(mapData.value.design.title || '');
            mapStore.setMapSubtitle(mapData.value.design.subTitle || '');
            mapStore.setSelectedStyle(mapData.value.design.style || 'minimal');
            mapStore.setSelectedComposition(mapData.value.design.composition || 'classy');
            mapStore.showInfo = mapData.value.design.showInfo !== false;
        }

        // Set map bounds, zoom, and dimensions
        if (mapData.value.bounds) {
            mapStore.setMapBounds(mapData.value.bounds);
        }
        if (mapData.value.zoom) {
            mapStore.setMapZoom(mapData.value.zoom);
        }
        if (mapData.value.width && mapData.value.height) {
            mapStore.setMapDimensions(mapData.value.width, mapData.value.height);
        }

        // Wait for store to persist data before navigation
        await nextTick();

        // Double check that location is set
        if (!mapStore.hasSelectedLocation) {
            console.error('Location not set in store after copy');
            return;
        }

        // Navigate to editor
        navigateTo('/maps/editor');
    } catch (error) {
        console.error('Error copying map data:', error);
    }
};

// Recreate map functionality (same as editMapCopy but with different navigation)
const recreateMap = async () => {
    if (!mapData.value) {
        console.error('No map data available to recreate');
        return;
    }

    // Get the map store
    const mapStore = useMapStore();

    try {
        // Clear any existing data first
        mapStore.clearLocation();

        // Extract location data from the map suggestion
        const suggestion = mapData.value.suggestion;

        if (suggestion) {
            // Create location object compatible with mapStore
            const location = {
                lat: suggestion.lat?.toString() || '',
                lon: suggestion.lon?.toString() || '',
                display_name: suggestion.display_name || '',
                name: suggestion.name || '',
                place_id: suggestion.place_id?.toString() || '',
                osm_type: suggestion.osm_type || 'node',
                osm_id: suggestion.osm_id?.toString() || '',
                class: suggestion.class || 'place',
                type: suggestion.type || 'city',
                importance: suggestion.importance || 0.5,
                boundingbox: suggestion.boundingbox || [],
            };

            // Set location in store
            mapStore.setSelectedLocation(location);
        }

        // Set map design data
        if (mapData.value.design) {
            mapStore.setMapTitle(mapData.value.design.title || '');
            mapStore.setMapSubtitle(mapData.value.design.subTitle || '');
            mapStore.setSelectedStyle(mapData.value.design.style || 'minimal');
            mapStore.setSelectedComposition(mapData.value.design.composition || 'classy');
            mapStore.showInfo = mapData.value.design.showInfo !== false;

            // Set custom info if exists
            if (mapData.value.design.customInfo) {
                mapStore.customInfo = mapData.value.design.customInfo;
            }

            // Set aspect ratio and landscape if exists
            if (mapData.value.design.aspect) {
                mapStore.mapAspect = mapData.value.design.aspect;
            }
            if (mapData.value.design.landscape !== undefined) {
                mapStore.mapLandscape = mapData.value.design.landscape;
            }

            // Set title and subtitle sizes if they exist
            if (mapData.value.design.titleSize !== undefined) {
                mapStore.mapTitleSize = mapData.value.design.titleSize;
            }
            if (mapData.value.design.subtitleSize !== undefined) {
                mapStore.mapSubtitleSize = mapData.value.design.subtitleSize;
            }
        }

        // Set map bounds, zoom, and dimensions
        if (mapData.value.bounds) {
            mapStore.setMapBounds(mapData.value.bounds);
        }
        if (mapData.value.zoom) {
            mapStore.setMapZoom(mapData.value.zoom);
        }
        if (mapData.value.width && mapData.value.height) {
            mapStore.setMapDimensions(mapData.value.width, mapData.value.height);
        }

        // Wait for store to persist data before navigation
        await nextTick();

        // Navigate to the map creation flow
        navigateTo('/maps/generate');
    } catch (error) {
        console.error('Error recreating map:', error);
        alert('Error recreating map. Please try again.');
    }
};

// Download map functionality
const downloadMap = async () => {
    if (!mapData.value || isDownloading.value || hasDownloaded.value) return;

    try {
        isDownloading.value = true;

        // Get the high-resolution image URL
        const imageUrl = mapData.value._references?.file_map?.url || mapData.value._references?.file_map_resized?.url;

        if (!imageUrl) {
            alert('No image available for download');
            return;
        }

        // Create a temporary link element to trigger download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${mapData.value.design?.title || 'map'}-${props.uid}.jpg`;
        link.target = '_blank';

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Mark as downloaded
        hasDownloaded.value = true;
    } catch (error) {
        console.error('Error downloading map:', error);
        alert('Error downloading map. Please try again.');
    } finally {
        isDownloading.value = false;
    }
};

// Go back to the previous page
const goBackPage = () => {
    openModalExit.value = false;
    if (document.referrer) {
        window.history.back();
    } else {
        navigateTo('/');
    }
};

// Set current URL on mount
onMounted(() => {
    currentUrl.value = window.location.href;
    getMapData();
});
</script>

<template>
    <div class="flex gap-3 items-center">
        <EffectGlass class="hidden md:flex gap-2 p-1 rounded-full" :displace="2">
            <UButton color="neutral" icon="i-tabler-arrow-left" variant="ghost" size="xl" @click="goBackPage" />
        </EffectGlass>
        <EffectGlass class="rounded-full p-1" :displace="2">
            <div class="flex gap-1 items-center">
                <!-- Share button with popover -->
                <UPopover mode="hover">
                    <UButton color="neutral" :label="$t('Share')" variant="ghost" size="xl" icon="i-tabler-share" />

                    <template #content>
                        <div class="grid grid-cols-2 gap-4 p-8">
                            <span class="col-span-2 text-center font-medium text-lg pb-4">{{ $t('Share this map') }}</span>

                            <UButton
                                color="neutral"
                                @click="shareOnX"
                                size="xl"
                                variant="outline"
                                icon="i-tabler-brand-x"
                                class="w-full justify-center"
                                :label="$t('X')" />

                            <UButton
                                color="neutral"
                                @click="shareOnFacebook"
                                size="xl"
                                variant="outline"
                                icon="i-tabler-brand-facebook"
                                class="w-full justify-center"
                                :label="$t('Facebook')" />

                            <UButton
                                color="neutral"
                                @click="shareOnLinkedIn"
                                size="xl"
                                variant="outline"
                                icon="i-tabler-brand-linkedin"
                                class="w-full justify-center"
                                :label="$t('LinkedIn')" />

                            <UButton
                                color="neutral"
                                @click="shareOnWhatsApp"
                                size="xl"
                                variant="outline"
                                icon="i-tabler-brand-whatsapp"
                                class="w-full justify-center"
                                :label="$t('WhatsApp')" />

                            <UButton
                                color="neutral"
                                class="col-span-2 w-full justify-center"
                                @click="copyToClipboard"
                                size="xl"
                                variant="outline"
                                icon="i-tabler-copy"
                                :label="$t('Copy URL')" />
                        </div>
                    </template>
                </UPopover>

                <!-- Options for non-owners -->
                <template v-if="!isOwner">
                    <!-- Vote button -->
                    <UButton
                        @click="toggleVote"
                        color="neutral"
                        variant="ghost"
                        :color="hasVoted ? 'error' : 'primary'"
                        size="xl"
                        :icon="hasVoted ? 'i-tabler-heart-filled' : 'i-tabler-heart'"
                        :class="{
                            'heart-pulse': loading,
                            'heart-explode': heartExplode,
                        }">
                        {{ voteCount == -1 ? $t('...') : voteCount }}
                    </UButton>

                    <div class="w-2"></div>

                    <!-- Recreate map button -->
                    <UButton class="md:hidden" @click="recreateMap" :label="$t('Get map')" icon="i-tabler-map" color="neutral" size="xl" />

                    <!-- Edit copy button -->
                    <UButton
                        class="hidden md:flex"
                        @click="editMapCopy"
                        :label="$t('Edit map')"
                        icon="i-tabler-wand"
                        color="neutral"
                        size="xl" />
                </template>

                <!-- Options for owners -->
                <template v-else>
                    <!-- Download button -->
                    <UButton
                        @click="downloadMap"
                        :label="hasDownloaded ? $t('Downloaded') : $t('Download')"
                        :icon="hasDownloaded ? 'i-tabler-check' : 'i-tabler-download'"
                        :loading="isDownloading"
                        :disabled="hasDownloaded"
                        color="neutral"
                        size="xl" />
                </template>
            </div>
        </EffectGlass>
    </div>
</template>

<style scoped>
/* Heart pulse animation for loading state */
.heart-pulse {
    animation: heartPulse 1s ease-in-out infinite;
}

@keyframes heartPulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

/* Heart explosion animation for vote click */
.heart-explode {
    animation: heartExplode 0.6s ease-out;
}

@keyframes heartExplode {
    0% {
        transform: scale(1);
        filter: brightness(1);
    }
    30% {
        transform: scale(1.3);
        filter: brightness(1.5);
    }
    60% {
        transform: scale(0.9);
        filter: brightness(1.2);
    }
    100% {
        transform: scale(1);
        filter: brightness(1);
    }
}

/* Optional: Add a subtle glow effect during explosion */
.heart-explode::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: glowExplode 0.6s ease-out;
    pointer-events: none;
    z-index: -1;
}

@keyframes glowExplode {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }
    50% {
        transform: translate(-50%, -50%) scale(2);
        opacity: 0.8;
    }
    100% {
        transform: translate(-50%, -50%) scale(3);
        opacity: 0;
    }
}

/* Ensure the button container has relative position for the glow effect */
.heart-explode {
    position: relative;
}
</style>
