<script setup>
// IMPORTS //////////////////////

import { createMapService } from '~~/shared/services/map';
import { styles, compositions } from '~~/data/design';
import { useAuthStore } from '~~/stores/authStore';
import { capitalize } from '~~/app/utils';

// SERVICES //////////////////////

const mapService = createMapService();

// COMPOSABLES & STORES //////////////////////

const authStore = useAuthStore();
const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();

// SEO //////////////////////

useHead({
    title: `${t('Explore Maps')} - Mappic`,
    meta: [{ name: 'description', content: t('Discover beautiful maps created by our community') }],
});

// DATA //////////////////////

const data = reactive({
    maps: [],
    loading: true,
    isInitialLoad: true,
    filters: {
        quality: 'all',
        style: 'all',
        composition: 'all',
        search: '',
        sort: 'votes',
    },
    pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
    },
});

// COMPUTED //////////////////////

const hasFilteredMaps = computed(() => data.maps.length > 0);
const totalPages = computed(() => {
    return Math.ceil(data.pagination.total / data.pagination.pageSize);
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

const sortOptions = [
    { key: 'votes', value: 'votes', label: capitalize(t('Most voted')) },
    { key: 'date', value: 'date', label: capitalize(t('Most recent')) },
];

// FUNCTIONS //////////////////////

async function getExploreMaps() {
    data.loading = true;

    try {
        // Siempre usar searchMaps (con o sin query)
        const hasSearch = data.filters.search && data.filters.search.trim() !== '';

        console.log('🔍 Usando searchMaps', hasSearch ? `con query: "${data.filters.search}"` : '(exploración general)');

        const result = await mapService.searchMaps({
            q: hasSearch ? data.filters.search : undefined,
            quality: data.filters.quality !== 'all' ? data.filters.quality : undefined,
            style: data.filters.style !== 'all' ? data.filters.style : undefined,
            composition: data.filters.composition !== 'all' ? data.filters.composition : undefined,
            sort: data.filters.sort,
            page: data.pagination.page,
            limit: data.pagination.pageSize,
        });

        if (result.success) {
            data.maps = result.items || [];
            data.pagination.total = result.total || 0;

            // Debug: Mostrar primeros 5 mapas
            console.log('✅ Resultados:', {
                total: data.pagination.total,
                mostrados: data.maps.length,
                pagina: data.pagination.page,
            });

            data.maps.slice(0, 5).forEach((m, index) => {
                console.log(`  ${index + 1}. Location: ${m.location?.name || 'N/A'} | Votes: ${m.votes || 0} | Quality: ${m.quality}`);
            });
        } else {
            console.error('❌ Error en resultado:', result.message);
            data.maps = [];
            data.pagination.total = 0;
        }
    } catch (error) {
        console.error('❌ Error getting explore maps:', error);
        data.maps = [];
        data.pagination.total = 0;
    } finally {
        data.loading = false;
    }
}

function handleSearch() {
    // Resetear página a 1 cuando se hace búsqueda
    data.pagination.page = 1;
    getExploreMaps();
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
        sort: 'votes',
    };
}

// WATCHERS //////////////////////

// Watch para otros filtros (sin debounce)
watch(
    () => [data.filters.quality, data.filters.style, data.filters.composition, data.filters.sort],
    () => {
        if (!data.isInitialLoad) {
            data.pagination.page = 1;
            getExploreMaps();
        }
    }
);

// Watch para búsqueda: si se borra el texto, recargar automáticamente
watch(
    () => data.filters.search,
    (newValue, oldValue) => {
        // Solo recargar si se borró el texto (de algo a vacío)
        if (!data.isInitialLoad && oldValue && !newValue) {
            data.pagination.page = 1;
            getExploreMaps();
        }
    }
);

// Sincronizar página con URL (ignorar en carga inicial)
watch(
    () => data.pagination.page,
    newPage => {
        if (!data.isInitialLoad) {
            router.push({
                query: {
                    ...route.query,
                    page: newPage > 1 ? newPage : undefined,
                },
            });
        }
    }
);

// Scroll al top cuando cambie la página en la URL
watch(
    () => route.query.page,
    () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }
);

// LIFECYCLE //////////////////////

onMounted(async () => {
    // Leer página inicial de la URL
    const pageFromUrl = parseInt(route.query.page) || 1;
    data.pagination.page = pageFromUrl;

    await getExploreMaps();

    // Marcar que la carga inicial ha terminado
    nextTick(() => {
        data.isInitialLoad = false;
    });
});
</script>

<template>
    <div class="min-h-[calc(100vh-4rem)] flex justify-center">
        <div class="flex flex-col pb-10 gap-10 w-full">
            <div class="mt-20 md:p-4">
                <!-- Titulo -->
                <h1 class="text-4xl md:text-6xl max-w-3xl font-medium tracking-tight text-balance">
                    {{ t('Explore maps and discover new ones') }}
                </h1>

                <!-- Search Section -->
                <div class="flex flex-col gap-6 mt-4 md:mt-10">
                    <!-- Search Input -->
                    <div class="flex gap-2">
                        <UFormField :label="$t('Search by location or title')" class="w-full max-w-2xl">
                            <UInput
                                v-model="data.filters.search"
                                :placeholder="$t('e.g. Barcelona, New York, Paris...')"
                                color="neutral"
                                size="xl"
                                :icon="'i-tabler-search'"
                                class="w-full"
                                @keyup.enter="handleSearch" />
                        </UFormField>
                        <div class="pt-6">
                            <UButton
                                :label="$t('Search')"
                                color="neutral"
                                size="xl"
                                icon="i-tabler-search"
                                class="w-full hidden md:flex"
                                @click="handleSearch" />
                            <UButton color="neutral" size="lg" icon="i-tabler-arrow-right" class="w-full md:hidden" @click="handleSearch" />
                        </div>
                    </div>

                    <!-- Filters Section -->
                    <div class="flex justify-between items-end relative z-10 pb-6 border-b border-black/10">
                        <div class="flex flex-col lg:flex-row justify-between w-full gap-6">
                            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
                                <div>
                                    <UFormField :label="$t('Quality')">
                                        <USelect
                                            v-model="data.filters.quality"
                                            color="neutral"
                                            class="w-full"
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
                                            class="w-full"
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
                                            class="w-full"
                                            :items="compositionOptions"
                                            value-key="key"
                                            text-key="label" />
                                    </UFormField>
                                </div>
                                <div>
                                    <UFormField :label="$t('Sort by')">
                                        <USelect
                                            v-model="data.filters.sort"
                                            color="neutral"
                                            class="w-full"
                                            :items="sortOptions"
                                            value-key="key"
                                            text-key="label" />
                                    </UFormField>
                                </div>
                            </div>
                        </div>

                        <!-- Results Count -->
                        <div class="hidden lg:flex min-w-40 justify-end">
                            <span class="text-sm">{{ data.pagination.total }} {{ $t('maps found') }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="data.loading" class="fixed inset-0 z-50 flex items-center justify-center">
                <Loader />
            </div>

            <!-- No Results State -->
            <div v-else-if="!hasFilteredMaps" class="flex flex-col w-full items-center justify-center py-20">
                <span class="text-lg">{{ $t('No maps found with the current filters.') }}</span>
            </div>

            <!-- Maps Grid -->
            <div v-else>
                <div class="w-full grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-20 mb-8 md:p-4">
                    <MapsItem v-for="map in data.maps" :key="map.uid" :map="map" @select="handleMapSelect" :editable="false" />
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="flex justify-center mt-8 p-10 pb-20">
                    <UPagination
                        v-model:page="data.pagination.page"
                        :total="data.pagination.total"
                        :items-per-page="data.pagination.pageSize"
                        :sibling-count="1"
                        show-edges
                        color="neutral"
                        active-color="primary"
                        size="lg" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
