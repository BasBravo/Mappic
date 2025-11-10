<script setup>
import { createMapService } from '~~/shared/services/map';

// Services
const mapService = createMapService();

// Reactive data
const data = reactive({
    maps: [],
});

const mapsLength = 40;
const mapsPack = 100;

// Animation constants
const ANIMATION_DELAY_INCREMENT = 50; // Delay between each item animation (ms)
const MAX_ANIMATED_ITEMS = 4; // Maximum number of items to animate per column

// Shuffle function
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Get maps from service
async function getMaps() {
    console.log('[getMaps] Starting...');
    
    // Check if maps are cached in localStorage for one week
    if (localStorage.getItem('landing_maps_date_v4') && localStorage.getItem('landing_maps')) {
        const lastDate = new Date(localStorage.getItem('landing_maps_date_v4'));
        const now = new Date();
        const diff = now.getTime() - lastDate.getTime();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;

        console.log('[getMaps] Cache found. Age:', diff / 1000 / 60, 'minutes');

        if (diff < oneWeek) {
            const cachedMaps = JSON.parse(localStorage.getItem('landing_maps'));
            console.log('[getMaps] Cached maps:', cachedMaps);
            // Check if cache has valid data (not empty arrays)
            const hasValidData = cachedMaps && Array.isArray(cachedMaps) && cachedMaps.length > 0 && cachedMaps.some(col => col.length > 0);
            if (hasValidData) {
                data.maps = cachedMaps;
                console.log('[getMaps] Using cached maps. Total columns:', data.maps.length);
                return;
            } else {
                console.log('[getMaps] Cache has empty arrays, clearing and fetching fresh data');
                localStorage.removeItem('landing_maps');
                localStorage.removeItem('landing_maps_date_v4');
            }
        }
    }

    console.log('[getMaps] Fetching from service...');
    const filters = [
        { key: 'file_map', operator: '!=', value: null },
        { key: 'quality', operator: '==', value: 'high' },
        { key: 'created_at', direction: 'desc' },
    ];
    const pagination = {
        page: 0,
        rowsPerPage: mapsPack,
        sortBy: 'created_at',
        sortType: 'desc',
    };

    console.log('[getMaps] Sending to service:', { pagination, filters });
    const result = await mapService.getMaps({ pagination, filters });
    console.log('[getMaps] Service result:', result);
    console.log('[getMaps] Result success:', result.success);
    console.log('[getMaps] Result items:', result.items);
    console.log('[getMaps] Result total:', result.total);

    if (result.success) {
        console.log('[getMaps] Items count:', result.items?.length);
        // Parse items to get only UIDs
        const parseItems = result.items.map(item => item.uid);
        console.log('[getMaps] Parsed UIDs:', parseItems.length);
        
        const finalItems = shuffle(parseItems).slice(0, mapsLength);
        console.log('[getMaps] Final items after shuffle:', finalItems.length);

        // Create 8 columns
        const columns = [];
        for (let i = 0; i < 8; i++) {
            columns.push([...shuffle(finalItems)]);
        }

        data.maps = columns;
        console.log('[getMaps] Created columns:', columns.length, 'with', columns[0]?.length, 'items each');

        // Save to localStorage for one week
        localStorage.setItem('landing_maps', JSON.stringify(data.maps));
        localStorage.setItem('landing_maps_date_v4', new Date().toISOString());
        console.log('[getMaps] Saved to localStorage');
    } else {
        console.error('[getMaps] Service failed:', result.message);
    }
}

// Handle map selection
const handleMapSelect = uid => {
    // Navigate to map detail page
    navigateTo(`/map/${uid}`);
};

// Animation system
const animationDelays = ref({});
const isAnimationReady = ref(false);
const readyMaps = ref(new Set());

// Generate random animation delays for first items across all columns
const generateRandomDelays = () => {
    const delays = {};
    const totalItems = 8 * MAX_ANIMATED_ITEMS; // 8 columns × MAX_ANIMATED_ITEMS each

    // Create array of sequential delay values
    const delayValues = [];
    for (let i = 0; i < totalItems; i++) {
        delayValues.push(i * ANIMATION_DELAY_INCREMENT);
    }

    // Shuffle the delay values randomly
    const shuffledDelays = shuffle(delayValues);

    // Distribute shuffled delays across columns
    let delayIndex = 0;
    for (let col = 0; col < 8; col++) {
        delays[col] = [];

        for (let i = 0; i < MAX_ANIMATED_ITEMS; i++) {
            delays[col].push(shuffledDelays[delayIndex]);
            delayIndex++;
        }
    }

    animationDelays.value = delays;

    // Start animations after a short delay
    setTimeout(() => {
        isAnimationReady.value = true;
    }, 100);
};

// Get animation delay for specific item
const getAnimationDelay = (columnIndex, itemIndex) => {
    if (itemIndex >= MAX_ANIMATED_ITEMS) return 0; // Only animate first MAX_ANIMATED_ITEMS items
    return animationDelays.value[columnIndex]?.[itemIndex] || 0;
};

// Handle map ready event
const handleMapReady = uid => {
    readyMaps.value.add(uid);
};

// Check if map is ready to animate
const isMapReady = (uid, index) => {
    if (index >= MAX_ANIMATED_ITEMS) return true; // Items beyond MAX_ANIMATED_ITEMS should be visible immediately
    return readyMaps.value.has(uid) && isAnimationReady.value;
};

// Lifecycle
onMounted(async () => {
    await getMaps();
    generateRandomDelays();
});
</script>

<template>
    <div class="relative w-full">
        <!-- Grid -->
        <div
            v-if="data.maps.length > 0"
            class="relative z-0 grid w-full h-full gap-4 lg:gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
            <!-- Column 1 -->
            <div class="flex flex-col gap-4 lg:gap-8">
                <div class="h-60"></div>
                <div
                    v-for="(uid, index) in data.maps[0]"
                    :key="'col1-' + index"
                    class="fade-in-item"
                    :class="{ 'opacity-0': index < MAX_ANIMATED_ITEMS && !isMapReady(uid, index) }"
                    :style="
                        index < MAX_ANIMATED_ITEMS
                            ? {
                                  animationDelay: `${getAnimationDelay(0, index)}ms`,
                                  animationDuration: '600ms',
                              }
                            : {}
                    ">
                    <MapStatic :uid="uid" @click="handleMapSelect" @ready="handleMapReady(uid)" />
                </div>
            </div>

            <!-- Column 2 -->
            <div class="flex flex-col gap-4 lg:gap-8">
                <div class="h-20"></div>
                <div
                    v-for="(uid, index) in data.maps[1]"
                    :key="'col2-' + index"
                    class="fade-in-item"
                    :class="{ 'opacity-0': index < MAX_ANIMATED_ITEMS && !isMapReady(uid, index) }"
                    :style="
                        index < MAX_ANIMATED_ITEMS
                            ? {
                                  animationDelay: `${getAnimationDelay(1, index)}ms`,
                                  animationDuration: '600ms',
                              }
                            : {}
                    ">
                    <MapStatic :uid="uid" @click="handleMapSelect" @ready="handleMapReady(uid)" />
                </div>
            </div>

            <!-- Column 3 (hidden on mobile) -->
            <div class="hidden sm:flex flex-col gap-4 lg:gap-8">
                <div class="h-36"></div>
                <div
                    v-for="(uid, index) in data.maps[2]"
                    :key="'col3-' + index"
                    class="fade-in-item"
                    :class="{ 'opacity-0': index < MAX_ANIMATED_ITEMS && !isMapReady(uid, index) }"
                    :style="
                        index < MAX_ANIMATED_ITEMS
                            ? {
                                  animationDelay: `${getAnimationDelay(2, index)}ms`,
                                  animationDuration: '600ms',
                              }
                            : {}
                    ">
                    <MapStatic :uid="uid" @click="handleMapSelect" @ready="handleMapReady(uid)" />
                </div>
            </div>

            <!-- Column 4 (hidden on small screens) -->
            <div class="hidden lg:flex flex-col gap-4 lg:gap-8">
                <div class="h-8"></div>
                <div
                    v-for="(uid, index) in data.maps[3]"
                    :key="'col4-' + index"
                    class="fade-in-item"
                    :class="{ 'opacity-0': index < MAX_ANIMATED_ITEMS && !isMapReady(uid, index) }"
                    :style="
                        index < MAX_ANIMATED_ITEMS
                            ? {
                                  animationDelay: `${getAnimationDelay(3, index)}ms`,
                                  animationDuration: '600ms',
                              }
                            : {}
                    ">
                    <MapStatic :uid="uid" @click="handleMapSelect" @ready="handleMapReady(uid)" />
                </div>
            </div>

            <!-- Column 5 (hidden on medium screens and below) -->
            <div class="hidden 2xl:flex flex-col gap-4 lg:gap-8">
                <div class="h-26"></div>
                <div
                    v-for="(uid, index) in data.maps[4]"
                    :key="'col5-' + index"
                    class="fade-in-item"
                    :class="{ 'opacity-0': index < MAX_ANIMATED_ITEMS && !isMapReady(uid, index) }"
                    :style="
                        index < MAX_ANIMATED_ITEMS
                            ? {
                                  animationDelay: `${getAnimationDelay(4, index)}ms`,
                                  animationDuration: '600ms',
                              }
                            : {}
                    ">
                    <MapStatic :uid="uid" @click="handleMapSelect" @ready="handleMapReady(uid)" />
                </div>
            </div>

            <!-- Column 6 (hidden on large screens and below) -->
            <div class="hidden 3xl:flex flex-col gap-4 lg:gap-8">
                <div
                    v-for="(uid, index) in data.maps[5]"
                    :key="'col6-' + index"
                    class="fade-in-item"
                    :class="{ 'opacity-0': index < MAX_ANIMATED_ITEMS && !isMapReady(uid, index) }"
                    :style="
                        index < MAX_ANIMATED_ITEMS
                            ? {
                                  animationDelay: `${getAnimationDelay(5, index)}ms`,
                                  animationDuration: '600ms',
                              }
                            : {}
                    ">
                    <MapStatic :uid="uid" @click="handleMapSelect" @ready="handleMapReady(uid)" />
                </div>
            </div>

            <!-- Column 7 (hidden on extra large screens and below) -->
            <!-- 2xl:flex -->
            <div class="hidden flex-col gap-4 lg:gap-8">
                <div
                    v-for="(uid, index) in data.maps[6]"
                    :key="'col7-' + index"
                    class="fade-in-item"
                    :class="{ 'opacity-0': index < MAX_ANIMATED_ITEMS && !isMapReady(uid, index) }"
                    :style="
                        index < MAX_ANIMATED_ITEMS
                            ? {
                                  animationDelay: `${getAnimationDelay(6, index)}ms`,
                                  animationDuration: '600ms',
                              }
                            : {}
                    ">
                    <MapStatic :uid="uid" @click="handleMapSelect" @ready="handleMapReady(uid)" />
                </div>
            </div>

            <!-- Column 8 (hidden on 2xl screens and below) -->
            <!-- 3xl:flex  -->
            <div class="hidden flex-col gap-4 lg:gap-8">
                <div
                    v-for="(uid, index) in data.maps[7]"
                    :key="'col8-' + index"
                    class="fade-in-item"
                    :class="{ 'opacity-0': index < MAX_ANIMATED_ITEMS && !isMapReady(uid, index) }"
                    :style="
                        index < MAX_ANIMATED_ITEMS
                            ? {
                                  animationDelay: `${getAnimationDelay(7, index)}ms`,
                                  animationDuration: '600ms',
                              }
                            : {}
                    ">
                    <MapStatic :uid="uid" @click="handleMapSelect" @ready="handleMapReady(uid)" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Fade in animation */
.fade-in-item {
    opacity: 1;
    animation-name: fadeIn;
    animation-fill-mode: both;
    animation-timing-function: ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* Items beyond MAX_ANIMATED_ITEMS should be visible immediately */
.fade-in-item:nth-child(n + 11) {
    animation: none;
    opacity: 1;
}
</style>
