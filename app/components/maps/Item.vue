<script setup>
const props = defineProps({
    map: {
        type: Object,
        required: true,
    },
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
            <a :href="`/${locale}/maps/${map.uid}`" class="block w-full">
                <MapStatic
                    :key="`${map.uid}-${map._refreshKey || 0}`"
                    class="shadow-none w-full rounded-lg cursor-pointer"
                    :class="{ 'opacity-50': map.in_progress }"
                    :uid="map.uid"
                    :interactive="false"
                    @click="handleMapSelect" />
            </a>
        </div>

        <div class="flex flex-col justify-between gap-2 px-2 md:px-4 py-4 md:py-2 flex-1">
            <div class="flex items-center gap-2">
                <h3 class="text-2xl font-semibold text-gray-900" :class="{ 'text-gray-500': map.in_progress }">
                    {{ map.design?.title || '-' }}
                </h3>
                <div v-if="map.in_progress" class="flex items-center px-2">
                    <Loader size="16" />
                </div>
            </div>

            <div class="flex flex-wrap gap-2">
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
            </div>
            <div class="h-2" />
            <div v-if="!map.in_progress">
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
                    <div class="flex gap-1 items-center">
                        <UButton
                            size="sm"
                            color="primary"
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
                <div v-else class="flex gap-1 items-center">
                    <div>
                        <UButton size="sm" variant="outline" :disabled="map.in_progress" @click="handleViewClick" :label="$t('View')" />
                    </div>

                    <UDropdownMenu
                        :items="mapOptions"
                        :ui="{
                            content: 'w-48',
                        }">
                        <UButton
                            variant="outline"
                            size="sm"
                            :disabled="map.in_progress"
                            icon="i-tabler-dots-vertical"
                            @click.stop="selectMapForOptions" />
                    </UDropdownMenu>
                </div>
            </div>
        </div>
    </div>
</template>
