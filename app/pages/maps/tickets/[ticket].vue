<script setup>
import { createMapService } from '~~/shared/services/map';
import { useAuthStore } from '~~/stores/authStore';
import JSConfetti from 'js-confetti';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const mapService = createMapService();

const ticket = route.params.ticket;
const mapData = ref(null);
const loading = ref(true);
const error = ref(null);
const pollingInterval = ref(null);
const jsConfetti = ref(null);

// Computed para obtener el estado del mapa
const mapStatus = computed(() => {
    if (!mapData.value) return 'processing';
    return mapData.value.status;
});

// Computed para verificar si el usuario está autenticado
const isLoggedIn = computed(() => authStore.isAuthenticated);

const statusConfig = computed(() => {
    const configs = {
        processing: {
            icon: 'i-tabler-loader-2',
            color: 'black',
            title: 'Processing',
            description: 'text-processing-ticket',
            showProgress: true,
        },
        success: {
            icon: 'i-tabler-check',
            color: 'green',
            title: 'Success!',
            description: 'text-success-ticket',
            showProgress: false,
        },
        error: {
            icon: 'i-tabler-x',
            color: 'red',
            title: 'Error',
            description: 'text-error-ticket',
            showProgress: false,
        },
    };
    return configs[mapStatus.value] || configs.processing;
});

// Función para obtener los datos del mapa
async function fetchMapData() {
    try {
        loading.value = true;
        error.value = null;

        const result = await mapService.getByTicket(ticket);

        if (result.success && result.data) {
            mapData.value = result.data;
        } else {
            error.value = 'Map not found';
        }
    } catch (err) {
        console.error('Error fetching map data:', err);
        error.value = 'Failed to fetch map data';
    } finally {
        loading.value = false;
    }
}

// Función para iniciar el polling
function startPolling() {
    if (pollingInterval.value) return;

    pollingInterval.value = setInterval(async () => {
        if (mapStatus.value === 'processing') {
            await fetchMapData();
        } else {
            stopPolling();
        }
    }, 3000); // Consultar cada 3 segundos
}

// Función para detener el polling
function stopPolling() {
    if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
        pollingInterval.value = null;
    }
}

// Función para crear nuevo mapa
function createNew() {
    router.push('/');
}

// Función para ver mis mapas
function viewMyMaps() {
    router.push('/maps/my-maps');
}

// Función para descargar mapa (cuando esté listo)
async function downloadMap() {
    if (!mapData.value || mapStatus.value !== 'success') return;

    try {
        // Obtener la URL de la imagen en alta resolución
        const imageUrl = mapData.value._references?.file_map?.url || mapData.value._references?.file_map_resized?.url;

        if (!imageUrl) {
            alert('No image available for download');
            return;
        }

        // Crear un elemento link temporal para activar la descarga
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${mapData.value.design?.title || 'map'}-${ticket}.jpg`;
        link.target = '_blank';

        // Agregar al body, hacer clic y remover
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading map:', error);
        alert('Error downloading map. Please try again.');
    }
}

// Función para mostrar confeti
function showConfetti() {
    if (jsConfetti.value) {
        jsConfetti.value.addConfetti({
            confettiColors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'],
            confettiRadius: 6,
            confettiNumber: 300,
        });
    }
}

// Lifecycle
onMounted(async () => {
    // Inicializar js-confetti
    if (process.client) {
        jsConfetti.value = new JSConfetti();
    }

    if (!ticket) {
        router.push('/');
        return;
    }

    await fetchMapData();

    // Si el mapa ya está listo (success), mostrar confeti
    if (mapStatus.value === 'success') {
        nextTick(() => {
            showConfetti();
        });
    }

    // Solo iniciar polling si el mapa está en processing
    if (mapStatus.value === 'processing') {
        startPolling();
    }
});

// Watcher para detectar cambios de estado a success
watch(mapStatus, (newStatus, oldStatus) => {
    if (newStatus === 'success' && oldStatus === 'processing') {
        nextTick(() => {
            showConfetti();
        });
    }
});

onUnmounted(() => {
    stopPolling();
});
</script>

<template>
    <div class="w-full h-full flex items-center justify-center p-6">
        <div class="max-w-md w-full md:-translate-x-12 md:translate-y-6">
            <!-- Loading state -->
            <div v-if="loading && !mapData" class="flex flex-col items-center justify-center space-y-4">
                <!-- <UIcon name="i-tabler-loader-2" class="animate-spin text-4xl text-black" /> -->
                <Loader color="#000000" />
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="flex flex-col bg-white rounded-4xl border-2 border-red-200 p-10 gap-6 items-center">
                <UIcon name="i-tabler-alert-circle" class="text-6xl text-red-500" />
                <div class="text-center space-y-2">
                    <h2 class="text-2xl font-bold text-red-600">{{ $t('Error') }}</h2>
                    <p class="text-gray-600">{{ error }}</p>
                </div>
                <UButton @click="createNew" :label="$t('Create new map')" color="primary" size="lg" class="w-full justify-center" />
            </div>

            <!-- Map data state -->
            <div v-else-if="mapData" class="flex flex-col bg-white rounded-4xl border-2 border-black/10 p-10 gap-6 items-center">
                <!-- Status info -->
                <div class="text-center space-y-2">
                    <h2
                        class="text-3xl font-bold"
                        :class="{
                            'text-black': statusConfig.color === 'black',
                            'text-green-600': statusConfig.color === 'green',
                            'text-red-600': statusConfig.color === 'red',
                        }">
                        {{ $t(statusConfig.title) }}
                    </h2>
                    <p class="text-gray-600">{{ $t(statusConfig.description) }}</p>
                </div>

                <!-- Ticket info -->
                <div class="text-center space-y-1">
                    <p class="text-sm text-gray-500">{{ $t('Ticket') }}</p>
                    <p class="font-mono text-lg font-bold">#{{ ticket }}</p>
                </div>

                <!-- Map details -->
                <div class="w-full flex flex-col text-sm text-gray-600 divide-y divide-black/10">
                    <div class="flex justify-between items-center py-1">
                        <span>{{ $t('Title') }}:</span>
                        <span>{{ mapData.design?.title || '-' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-1">
                        <span>{{ $t('Quality') }}:</span>
                        <span>{{ $t(mapData.quality).toUpperCase() || '-' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-1">
                        <span>{{ $t('Format') }}:</span>
                        <span>{{ $t(mapData.format) || '-' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-1">
                        <span>{{ $t('Credits used') }}:</span>
                        <span>{{ mapData.credits_used || '-' }}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col w-full gap-3 pt-4">
                    <!-- Download button (only for success) -->
                    <UButton
                        v-if="mapStatus === 'success'"
                        @click="downloadMap"
                        :label="$t('Download map')"
                        icon="i-tabler-download"
                        size="xl"
                        class="w-full justify-center" />

                    <!-- View my maps (only for logged in users) -->
                    <UButton
                        v-if="isLoggedIn"
                        @click="viewMyMaps"
                        :label="$t('View my maps')"
                        icon="i-tabler-map"
                        variant="outline"
                        size="xl"
                        class="w-full justify-center" />

                    <!-- Create new -->
                    <UButton
                        @click="createNew"
                        :label="$t('Create new map')"
                        icon="i-tabler-plus"
                        variant="outline"
                        size="xl"
                        class="w-full justify-center" />
                </div>
            </div>
        </div>
    </div>
</template>
