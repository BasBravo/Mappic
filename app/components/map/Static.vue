<script setup>
import { createMapService } from '~~/shared/services/map';

// Props
const props = defineProps({
    uid: {
        type: String,
        required: true,
    },
    interactive: {
        type: Boolean,
        default: true,
    },
});

// Emits
const emit = defineEmits(['click', 'ready']);

// Services
const mapService = createMapService();

// Reactive data
const mapData = ref(null);
const loading = ref(true);
const error = ref(false);
const imageUrl = ref('');
const ready = ref(false);
const imageLoaded = ref(false);

// Cache management
const CACHE_PREFIX = 'mappic_map_';
const CACHE_EXPIRY_HOURS = 24; // Cache maps for 24 hours

// Check if cached data is still valid
function isCacheValid(timestamp) {
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
    return now - timestamp < expiryTime;
}

// Check if key fields have changed
function hasKeyFieldsChanged(cachedFields, currentData) {
    if (!cachedFields || !currentData) return true;

    const currentFields = {
        file_map_resized: currentData?._references?.file_map_resized?.url || null,
        status: currentData?.status || null,
        in_progress: currentData?.in_progress || null,
    };

    return (
        cachedFields.file_map_resized !== currentFields.file_map_resized ||
        cachedFields.status !== currentFields.status ||
        cachedFields.in_progress !== currentFields.in_progress
    );
}

// Clean expired cache entries
function cleanExpiredCache() {
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                try {
                    const item = localStorage.getItem(key);
                    const parsedItem = JSON.parse(item);
                    if (!isCacheValid(parsedItem.timestamp)) {
                        keysToRemove.push(key);
                    }
                } catch (e) {
                    // If parsing fails, remove the corrupted item
                    keysToRemove.push(key);
                }
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        return keysToRemove.length;
    } catch (err) {
        console.error('Error cleaning cache:', err);
        return 0;
    }
}

// Clean old cache entries to free space
function cleanOldestCacheEntries(maxEntriesToKeep = 10) {
    try {
        const mapCacheEntries = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                try {
                    const item = localStorage.getItem(key);
                    const parsedItem = JSON.parse(item);
                    mapCacheEntries.push({
                        key,
                        timestamp: parsedItem.timestamp || 0,
                    });
                } catch (e) {
                    // Remove corrupted entries
                    localStorage.removeItem(key);
                }
            }
        }

        // Sort by timestamp (oldest first) and remove excess entries
        if (mapCacheEntries.length > maxEntriesToKeep) {
            mapCacheEntries.sort((a, b) => a.timestamp - b.timestamp);
            const entriesToRemove = mapCacheEntries.slice(0, mapCacheEntries.length - maxEntriesToKeep);
            entriesToRemove.forEach(entry => localStorage.removeItem(entry.key));
            return entriesToRemove.length;
        }
        return 0;
    } catch (err) {
        console.error('Error cleaning oldest cache entries:', err);
        return 0;
    }
}

// Cache map data with key fields for comparison
function cacheMapData(uid, data) {
    try {
        const cacheKey = `${CACHE_PREFIX}${uid}`;
        const cacheData = {
            data: data,
            timestamp: Date.now(),
            // Store key fields to detect changes
            keyFields: {
                file_map_resized: data?._references?.file_map_resized?.url || null,
                status: data?.status || null,
                in_progress: data?.in_progress || null,
            },
        };

        try {
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (quotaError) {
            if (quotaError.name === 'QuotaExceededError') {
                console.warn('LocalStorage quota exceeded, attempting to clean cache...');

                // First, try cleaning expired entries
                const expiredCleaned = cleanExpiredCache();

                // If that's not enough, clean oldest entries
                if (expiredCleaned === 0) {
                    const oldestCleaned = cleanOldestCacheEntries(5);
                }

                // Try saving again
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                } catch (secondAttemptError) {
                    console.warn('Still cannot cache after cleanup, operating without cache for this item');
                }
            } else {
                throw quotaError;
            }
        }
    } catch (err) {
        console.error('Error saving to cache:', err);
    }
}

// Get map data
async function getMapData() {
    try {
        loading.value = true;
        error.value = false;

        // Proactively clean expired cache entries on component load
        cleanExpiredCache();

        // Always fetch from service first to check for changes
        const result = await mapService.getMap(props.uid, { deep: true });

        if (!result) {
            error.value = true;
            return;
        }

        if (!result.success) {
            error.value = true;
            return;
        }

        // Check if we have cached data
        const cacheKey = `${CACHE_PREFIX}${props.uid}`;
        let cachedEntry = null;
        let shouldUseCache = false;

        // Try to read from localStorage with fallback
        try {
            cachedEntry = localStorage.getItem(cacheKey);
        } catch (storageError) {
            console.warn('[MapStatic] Error reading from localStorage:', storageError);
            cachedEntry = null;
        }

        if (cachedEntry) {
            try {
                const parsedEntry = JSON.parse(cachedEntry);
                const isValidTime = parsedEntry.timestamp && isCacheValid(parsedEntry.timestamp);
                const hasChanges = hasKeyFieldsChanged(parsedEntry.keyFields, result.data);

                // Use cache only if it's within time limit AND key fields haven't changed
                if (isValidTime && !hasChanges) {
                    shouldUseCache = true;
                    mapData.value = parsedEntry.data;
                    imageUrl.value = parsedEntry.data?._references?.file_map_resized?.url;
                } else {
                    // Remove outdated or changed cache
                    try {
                        localStorage.removeItem(cacheKey);
                    } catch (removeError) {
                        console.warn('[MapStatic] Error removing cache entry:', removeError);
                    }
                }
            } catch (err) {
                console.error('[MapStatic] Error parsing cached data:', err);
                try {
                    localStorage.removeItem(cacheKey);
                } catch (removeError) {
                    console.warn('[MapStatic] Error removing corrupted cache entry:', removeError);
                }
            }
        }

        // If not using cache, use fresh data and update cache
        if (!shouldUseCache) {
            mapData.value = result.data;
            imageUrl.value = result.data?._references?.file_map_resized?.url;

            // Cache the fresh data
            cacheMapData(props.uid, result.data);
        }
    } catch (err) {
        console.error('[MapStatic] Error fetching map data:', err);
        error.value = true;
    } finally {
        loading.value = false;
    }
}

// Handle click
const handleClick = () => {
    if (!props.interactive) return;

    // Navigate to map detail page
    navigateTo(`/maps/${props.uid}`);
};

// Handle image load error
const handleImageError = () => {
    error.value = true;
};

// Handle image load success
const handleImageLoad = () => {
    ready.value = true;
    imageLoaded.value = true;
    emit('ready');
};

// Lifecycle
onMounted(() => {
    getMapData();
});
</script>

<template>
    <div
        @click="handleClick"
        class="relative"
        :class="[props.interactive ? 'cursor-pointer hover:scale-105 transition-transform duration-300' : '']">
        <div
            class="w-full relative overflow-hidden rounded-2xl transition-all p-1.5 md:p-3 border border-black/20 bg-background"
            :class="[$attrs.class || '', props.interactive ? 'hover:p-0 hover:shadow-2xl' : '']">
            <div class="w-full aspect-[9/13] relative">
                <!-- Placeholder mientras carga -->
                <div
                    class="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center animate-pulse transition-opacity duration-300"
                    :class="imageLoaded || error ? 'opacity-0 pointer-events-none' : 'opacity-100'"></div>

                <!-- Map image -->
                <div v-if="imageUrl" class="absolute inset-0 rounded-lg overflow-hidden">
                    <img
                        :src="imageUrl"
                        :alt="mapData?.title || 'Map'"
                        class="w-full h-full object-cover transition-opacity duration-500"
                        :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
                        @error="handleImageError"
                        @load="handleImageLoad"
                        loading="lazy" />
                </div>
            </div>

            <!-- Error state -->
            <div v-if="error" class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div class="text-center">
                    <div class="text-xs text-gray-500 p-10">Map not available</div>
                </div>
            </div>

            <!-- Overlay with map info -->
            <!-- <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <h3 class="text-white text-sm font-medium">
                    {{ mapData?.title || 'Untitled Map' }}
                </h3>
                <p class="text-white/80 text-xs">
                    {{ mapData?.location?.display_name || props.uid.substring(0, 8) + '...' }}
                </p>
            </div> -->
        </div>
    </div>
</template>
