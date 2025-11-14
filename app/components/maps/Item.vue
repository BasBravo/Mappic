<script setup>
const props = defineProps({
    map: { type: Object, required: true },
    editable: { type: Boolean, default: false },
});

const emit = defineEmits(['delete', 'regenerate', 'select']);

// Composables
const { t, locale } = useI18n();

// Computed
const mapOptions = computed(() => [
    [
        {
            label: t('Delete'),
            icon: 'i-tabler-trash',
            onSelect: () => emit('delete', props.map),
        },
    ],
]);

const mapDimensionsInPixels = computed(() => {
    // Extract width and height from aspect ratio (e.g., "50:70" -> [50, 70])
    const widthPx = parseInt(props.map.width);
    const heightPx = parseInt(props.map.height);

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

// Quiero que in_progress sea un computed que devuelva true si props.map.in_progress es true
// Pero si lleva más de 1 hora desde la fecha de created_at, que devuelva false
const in_progress = computed(() => {
    const createdAt = props.map.created_at; // Puede ser Timestamp de Firestore o ms

    // Si no hay fecha de creación, usamos directamente el flag
    if (!createdAt) {
        return props.map.in_progress;
    }

    let createdAtMs;

    // Firestore Timestamp con toMillis()
    if (typeof createdAt === 'object' && typeof createdAt.toMillis === 'function') {
        createdAtMs = createdAt.toMillis();
    }
    // Objeto plano { seconds, nanoseconds }
    else if (typeof createdAt === 'object' && typeof createdAt.seconds === 'number') {
        const nanos = typeof createdAt.nanoseconds === 'number' ? createdAt.nanoseconds : 0;
        createdAtMs = createdAt.seconds * 1000 + Math.floor(nanos / 1e6);
    }
    // Ya viene como número (ms)
    else if (typeof createdAt === 'number') {
        createdAtMs = createdAt;
    }
    // Formato desconocido: no tocamos la lógica original
    else {
        return props.map.in_progress;
    }

    const now = Date.now();
    const diff = now - createdAtMs;
    const diffHours = diff / (1000 * 60 * 60);

    if (diffHours > 1) {
        return false;
    }
    return props.map.in_progress;
});

// Methods
function handleMapSelect() {
    if (!props.map.in_progress) {
        emit('select', props.map.uid);
    }
}

function handleViewClick() {
    if (!props.map.in_progress) {
        navigateTo(`/${locale.value}/maps/${props.map.uid}`);
    }
}

function handleDeleteClick() {
    emit('delete', props.map);
}

function handleRegenerateClick() {
    emit('regenerate', props.map);
}

function selectMapForOptions() {
    // This function is called when the dropdown is clicked
    // Could be used for additional logic if needed
}
</script>

<template>
    <div class="w-full flex flex-col lg:flex-row items-start relative">
        <div class="relative w-full lg:max-w-60">
            <NuxtLink :to="`/${locale}/maps/${map.uid}`" class="block w-full">
                <MapStatic
                    :key="`${map.uid}-${map._refreshKey || 0}`"
                    class="shadow-none w-full rounded-xl cursor-pointer"
                    :class="{ 'opacity-50': map.in_progress }"
                    :uid="map.uid"
                    :interactive="false"
                    @click="handleMapSelect" />
            </NuxtLink>
        </div>

        <div class="flex flex-col justify-between gap-2 px-2 md:px-4 py-4 md:py-2 flex-1">
            <div class="flex items-center gap-2">
                <NuxtLink :to="`/${locale}/maps/${map.uid}`">
                    <h3 class="text-2xl font-semibold text-gray-900" :class="{ 'text-gray-500': map.in_progress }">
                        {{ map.design?.title || '-' }}
                    </h3>
                </NuxtLink>
                <div v-if="map.in_progress" class="flex items-center px-2">
                    <Loader size="16" />
                </div>
            </div>

            <div class="flex flex-col gap-x-2 gap-y-1">
                <div class="flex items-center gap-1 text-xs">
                    <span class="text-gray-500">{{ $t('Quality') }}:</span>
                    <span class="font-mono font-bold uppercase">
                        {{ map.quality?.toUpperCase() || '-' }}
                    </span>
                </div>
                <div class="flex items-center gap-1 text-xs">
                    <span class="text-gray-500">{{ $t('Style') }}:</span>
                    <span class="font-mono font-bold uppercase">
                        {{ map.design?.style || '-' }}
                    </span>
                </div>
                <div v-if="map.in_progress" class="flex items-center gap-1 text-xs">
                    <span class="text-gray-500">{{ $t('Status') }}:</span>
                    <span class="font-mono font-bold uppercase">{{ $t('Processing') }}...</span>
                </div>
                <div v-if="map.is_purchased_copy" class="flex items-center gap-1 text-xs">
                    <span class="text-gray-500">{{ $t('Origin') }}:</span>
                    <span class="font-mono font-bold uppercase">{{ $t('Copy') }}</span>
                </div>
                <!-- votes -->
                <div class="flex items-center gap-1 text-xs">
                    <span class="text-gray-500">{{ $t('Votes') }}:</span>
                    <span class="font-mono font-bold uppercase">
                        {{ map.votes || 0 }}
                    </span>
                </div>
                <!-- credits -->
                <div class="flex items-center gap-1 text-xs">
                    <span class="text-gray-500">{{ $t('Credits') }}:</span>
                    <span class="font-mono font-bold uppercase">
                        {{ map.credits_used || 0 }}
                    </span>
                </div>
                <div class="w-full border-b my-1 border-black/10"></div>

                <!-- Dimensions -->
                <div class="flex flex-col gap-1 text-xs">
                    <!-- in cm -->
                    <span class="font-mono text-gray-500">{{ mapDimensionsInPixels.widthCm }}x{{ mapDimensionsInPixels.heightCm }} cm</span>
                    <!-- in px -->
                    <span class="font-mono text-gray-500">{{ mapDimensionsInPixels.widthPx }}x{{ mapDimensionsInPixels.heightPx }} px</span>
                </div>
                <template v-if="map._summary?.user">
                    <div class="w-full border-b my-1 border-black/10"></div>
                    <div class="flex items-center gap-1 text-xs">
                        <span class="text-gray-500">{{ $t('Created by') }}:</span>
                        <NuxtLink :to="`/${locale}/maps/explore/${map._summary.user.uid}`" class="font-mono font-bold uppercase underline">
                            {{ map._summary.user.name }}
                        </NuxtLink>
                    </div>
                </template>
            </div>

            <!-- <div v-if="props.user" class="flex items-center gap-1 text-xs mt-2">
                <span class="text-gray-500">{{ $t('Created by') }}:</span>
                <NuxtLink
                    :to="`/${locale}/maps/explore/${props.user.id}`"
                    class="font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                    {{ props.user.name }}
                </NuxtLink>
            </div> -->
            <div class="h-2" />
            <div v-if="!in_progress">
                <div v-if="map.error" class="flex flex-col gap-2">
                    <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div class="flex items-start gap-2">
                            <UIcon name="i-tabler-alert-circle" class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div class="text-sm">
                                <p class="text-red-800 font-medium">{{ $t('Error generating map') }}</p>
                                <p class="text-red-700 mt-1">
                                    {{ $t('No credits were charged due to this error') }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div v-if="editable" class="flex gap-1 items-center">
                        <UButton
                            size="sm"
                            color="neutral"
                            variant="outline"
                            icon="i-tabler-refresh"
                            :label="$t('Try again')"
                            @click="handleRegenerateClick" />

                        <UDropdownMenu
                            :items="mapOptions"
                            :ui="{
                                content: 'w-48',
                            }">
                            <UButton variant="outline" size="sm" icon="i-tabler-dots-vertical" @click.stop="selectMapForOptions" />
                        </UDropdownMenu>
                    </div>
                </div>
                <div v-else-if="editable" class="flex gap-1 items-center">
                    <div>
                        <UButton color="neutral" size="sm" variant="outline" @click="handleViewClick" :label="$t('View')" />
                    </div>

                    <UDropdownMenu
                        :items="mapOptions"
                        :ui="{
                            content: 'w-48',
                        }">
                        <UButton
                            color="neutral"
                            variant="outline"
                            size="sm"
                            icon="i-tabler-dots-vertical"
                            @click.stop="selectMapForOptions" />
                    </UDropdownMenu>
                </div>
            </div>
        </div>
    </div>
</template>
