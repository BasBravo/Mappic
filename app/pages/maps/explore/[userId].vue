<script setup>
// IMPORTS //////////////////////

import { createMapService } from '~~/shared/services/map';
import { createUser } from '~~/shared/services/user';
import { styles, compositions } from '~~/data/design';
import { useAuthStore } from '~~/stores/authStore';
import { capitalize } from '~~/app/utils';

// SERVICES //////////////////////

const mapService = createMapService();
const userService = createUser();

// COMPOSABLES & STORES //////////////////////

const authStore = useAuthStore();
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

// DATA //////////////////////

const userId = computed(() => route.params.userId);

const data = reactive({
    maps: [],
    filteredMaps: [],
    loading: true,
    name: '',
    userEmail: '',
    filters: {
        quality: 'all',
        style: 'all',
        composition: 'all',
        search: '',
    },
    pagination: {
        page: 1,
        pageSize: 12,
        total: 0,
    },
});

// SEO //////////////////////

useHead({
    title: computed(() => `${t('Maps by {user}', { user: data.name || userId.value })} - Mappic`),
    meta: [{ name: 'description', content: computed(() => t('View all maps by this user')) }],
});

// COMPUTED //////////////////////

const isUserAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const hasAnyMaps = computed(() => data.maps.length > 0);
const hasFilteredMaps = computed(() => data.filteredMaps.length > 0);

const paginatedMaps = computed(() => {
    const start = (data.pagination.page - 1) * data.pagination.pageSize;
    const end = start + data.pagination.pageSize;
    return data.filteredMaps.slice(start, end);
});

const totalPages = computed(() => {
    return Math.ceil(data.filteredMaps.length / data.pagination.pageSize);
});

// FILTER OPTIONS //////////////////////

const qualityOptions = [
    { key: 'all', value: 'all', label: capitalize(t('All')) },
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

// FUNCTIONS //////////////////////

async function getUserMaps() {
    data.loading = true;

    try {
        console.log('[getUserMaps] Starting to fetch maps for user:', userId.value);

        const filters = [
            { key: 'user', operator: '==', value: `doc:users/${userId.value}` },
            { key: 'quality', operator: '!=', value: 's' }, // Exclude small maps
            { key: 'status', operator: '==', value: 'success' },
            { key: 'is_purchased_copy', operator: '==', value: false },
            { key: 'created_at', direction: 'desc' },
        ];

        console.log('[getUserMaps] Filters:', JSON.stringify(filters, null, 2));

        const result = await mapService.getMaps({ filters });

        console.log('[getUserMaps] Result from mapService:', {
            success: result.success,
            itemsCount: result.items?.length || 0,
            message: result.message,
        });

        if (result.success) {
            const maps = result.items || [];
            console.log('[getUserMaps] Maps found:', maps.length);

            // Get user data
            const userResult = await userService.getUser(userId.value);
            let userData = null;

            console.log('User Result:', userResult);
            console.log('User ID:', userId.value);

            if (userResult.success && userResult.data) {
                console.log('User Data from Firestore:', userResult.data);
                const userName = userResult.data.name || userResult.data.email || 'Unknown';
                userData = {
                    id: userId.value,
                    name: userName,
                    email: userResult.data.email,
                };
                data.name = userName;
                data.userEmail = userResult.data.email || userId.value;
            } else {
                console.log('User not found, using fallback from maps');
                // Fallback to email from first map
                if (maps.length > 0) {
                    const fallbackName = maps[0].email || 'Unknown User';
                    data.name = fallbackName;
                    data.userEmail = maps[0].email || userId.value;
                    userData = {
                        id: userId.value,
                        name: fallbackName,
                        email: maps[0].email,
                    };
                } else {
                    // No maps and no user data
                    data.name = 'Unknown User';
                    data.userEmail = userId.value;
                }
            }

            console.log('Final data.name:', data.name);
            console.log('Final userData:', userData);

            // Enrich maps with user data
            data.maps = maps.map(map => ({
                ...map,
                user: userData || { id: userId.value, name: map.email || 'Unknown', email: map.email },
            }));

            data.pagination.total = data.maps.length;
            filterMaps(data.maps);

            console.log('[getUserMaps] Final data.maps count:', data.maps.length);
            console.log('[getUserMaps] Final data.filteredMaps count:', data.filteredMaps.length);
        } else {
            console.error('[getUserMaps] Failed to get maps:', result.message);
        }
    } catch (error) {
        console.error('[getUserMaps] Error getting user maps:', error);
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

    // Filter by search term
    if (data.filters.search.trim()) {
        const searchLower = data.filters.search.toLowerCase();
        filtered = filtered.filter(
            map =>
                map.design?.title?.toLowerCase().includes(searchLower) ||
                map.suggestion?.display_name?.toLowerCase().includes(searchLower) ||
                map.suggestion?.name?.toLowerCase().includes(searchLower)
        );
    }

    // Reset pagination when filters change
    data.pagination.page = 1;
    data.filteredMaps = filtered;
}

function handleMapSelect(uid) {
    navigateTo(`/${locale.value}/maps/${uid}`);
}

function clearFilters() {
    data.filters = {
        quality: 'all',
        style: 'all',
        composition: 'all',
        search: '',
    };
}

function goBackToExplore() {
    navigateTo(`/${locale.value}/maps/explore`);
}

// WATCHERS //////////////////////

watch(
    () => data.filters,
    () => {
        filterMaps(data.maps);
    },
    { deep: true }
);

// LIFECYCLE //////////////////////

onMounted(async () => {
    await getUserMaps();
});
</script>

<template>
    <div class="min-h-[calc(100vh-4rem)] flex justify-center">
        <div v-if="data.loading" class="fixed inset-0 z-50 flex items-center justify-center">
            <Loader />
        </div>

        <template v-else>
            <div class="flex flex-col pb-10 gap-10 w-full">
                <div class="mt-20 md:p-4">
                    <!-- Back Button -->
                    <div class="mb-4">
                        <UButton
                            variant="outline"
                            color="neutral"
                            icon="i-tabler-arrow-left"
                            :label="$t('Go Back')"
                            @click="goBackToExplore" />
                    </div>

                    <!-- Titulo -->
                    <h1 class="text-4xl md:text-6xl max-w-3xl font-semibold tracking-tight text-balance">
                        {{ $t('Maps by {user}', { user: data.name || userId }) }}
                    </h1>

                    <!-- Filters Section -->
                    <div class="flex justify-between items-center relative mt-4 md:mt-10 z-10 py-6 border-b border-black/10">
                        <div class="flex flex-col lg:flex-row justify-between w-full gap-6">
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
                        </div>

                        <!-- Results Count -->
                        <div class="pt-6 hidden lg:flex min-w-40 justify-end">
                            <span class="text-sm">{{ data.filteredMaps.length }} {{ $t('maps found') }}</span>
                        </div>
                    </div>
                </div>

                <!-- No Results State -->
                <div v-if="!hasFilteredMaps" class="flex flex-col w-full items-center justify-center py-20">
                    <span class="text-lg">{{ $t('No maps found for this user') }}</span>
                </div>

                <!-- Maps Grid -->
                <div v-else>
                    <div class="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-20 mb-8 md:p-4">
                        <MapsItem
                            v-for="map in paginatedMaps"
                            :key="map.uid"
                            :map="map"
                            :user="map.user"
                            @select="handleMapSelect"
                            :editable="false" />
                    </div>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="flex justify-center mt-8 p-10 pb-20">
                        <UPagination
                            v-model:page="data.pagination.page"
                            :total="data.filteredMaps.length"
                            :items-per-page="data.pagination.pageSize"
                            :sibling-count="1"
                            show-edges
                            color="neutral"
                            active-color="primary"
                            size="lg" />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped></style>
