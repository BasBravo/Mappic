<script setup>
// IMPORTS //////////////////////

import { createMapService } from '~~/shared/services/map';
import { getPurchasableMaps } from '~~/shared/services/mapPurchase';
import { styles, compositions } from '~~/data/design';
import { useAuthStore } from '~~/stores/authStore';
import { capitalize } from '~~/app/utils';

// SERVICES //////////////////////

const mapService = createMapService();

// COMPOSABLES & STORES //////////////////////

const authStore = useAuthStore();
const { t, locale } = useI18n();
const router = useRouter();

// SEO //////////////////////

useHead({
    title: `${t('Explore Maps')} - Mappic`,
    meta: [{ name: 'description', content: t('Discover beautiful maps created by our community') }],
});

// DATA //////////////////////

const data = reactive({
    maps: [],
    filteredMaps: [],
    loading: true,
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

async function getExploreMaps() {
    data.loading = true;

    try {
        const result = await mapService.getMaps({
            filters: [
                { key: 'quality', operator: '!=', value: 's' }, // Exclude small maps
                { key: 'status', operator: '==', value: 'success' },
                { key: 'created_at', direction: 'desc' },
            ],
        });

        if (result.success) {
            data.maps = result.items || [];
            data.pagination.total = data.maps.length;
            filterMaps(data.maps);
        }
    } catch (error) {
        console.error('Error getting explore maps:', error);
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
    await getExploreMaps();
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
                    <!-- Titulo -->
                    <h1 class="text-4xl md:text-6xl max-w-3xl font-semibold tracking-tight text-balance">
                        {{ t('Explore maps and discover new ones') }}
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
                    <span class="text-lg">{{ $t('No maps found with the current filters.') }}</span>
                </div>

                <!-- Maps Grid -->
                <div v-else>
                    <div class="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-20 mb-8 md:p-4">
                        <MapsItem v-for="map in paginatedMaps" :key="map.uid" :map="map" @select="handleMapSelect" :editable="false" />
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
