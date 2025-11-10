<script setup>
import { ref, watch, computed } from 'vue';
import { createMapService } from '~~/shared/services/map';

// Props
const props = defineProps({
    placeholder: {
        type: String,
        default: 'Search location...',
    },
    minLength: {
        type: Number,
        default: 2,
    },
    debounceTime: {
        type: Number,
        default: 500,
    },
});

// Emits
const emit = defineEmits(['location-selected']);

// Services
const mapService = createMapService();

// Reactive data
const search = ref('');
const suggestions = ref([]);
const isSearching = ref(false);
const showSuggestions = ref(false);

// Computed
const hasSuggestions = computed(() => suggestions.value.length > 0);

// Methods
async function searchSuggestions() {
    if (search.value.length < props.minLength) {
        suggestions.value = [];
        isSearching.value = false;
        showSuggestions.value = false;
        return;
    }

    isSearching.value = true;
    showSuggestions.value = true;

    try {
        const { $i18n } = useNuxtApp();
        const locale = $i18n.locale.value || 'en';
        const results = await mapService.searchSuggestions(search.value, locale);
        suggestions.value = results || [];
    } catch (error) {
        console.error('Error searching suggestions:', error);
        suggestions.value = [];
    } finally {
        isSearching.value = false;
    }
}

function selectSuggestion(suggestion) {
    search.value = suggestion.display_name;
    showSuggestions.value = false;
    suggestions.value = [];
    emit('location-selected', suggestion);
}

function clearSearch() {
    search.value = '';
    suggestions.value = [];
    showSuggestions.value = false;
}

function handleEnterKey() {
    if (hasSuggestions.value && suggestions.value.length > 0) {
        selectSuggestion(suggestions.value[0]);
    }
}

// Watchers
let searchTimeout;
watch(search, newValue => {
    clearTimeout(searchTimeout);

    if (newValue.length < props.minLength) {
        suggestions.value = [];
        isSearching.value = false;
        showSuggestions.value = false;
        return;
    }

    searchTimeout = setTimeout(() => {
        if (search.value === newValue) {
            searchSuggestions();
        }
    }, props.debounceTime);
});

// Expose methods
defineExpose({
    clearSearch,
    searchSuggestions,
});
</script>

<template>
    <div class="relative w-full">
        <!-- Input de búsqueda -->

        <UInput
            v-model="search"
            :placeholder="placeholder"
            size="3xl"
            class="w-full"
            @keydown.escape="showSuggestions = false"
            @focus="showSuggestions = hasSuggestions"
            @keydown.enter.prevent="handleEnterKey">
            <template #leading>
                <UIcon name="i-tabler-search" size="22" class="text-gray-400 transition-colors duration-200" />
            </template>

            <template #trailing>
                <div v-if="isSearching" class="flex items-center justify-center">
                    <!-- <UIcon name="i-tabler-loader-2" class="text-xl animate-spin text-gray-400" /> -->
                    <Loader size="18" />
                </div>
                <UButton
                    v-else-if="search"
                    variant="ghost"
                    size="lg"
                    icon="i-tabler-x"
                    aria-label="Clear input"
                    class="-mr-2 z-10"
                    @click="clearSearch" />
            </template>
        </UInput>

        <!-- Lista de sugerencias -->
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <div
                v-if="showSuggestions && hasSuggestions"
                class="absolute z-50 w-full mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-hidden">
                <div class="overflow-y-auto max-h-80">
                    <div
                        v-for="(suggestion, index) in suggestions"
                        :key="`suggestion-${index}`"
                        @click="selectSuggestion(suggestion)"
                        class="group relative px-5 py-4 cursor-pointer transition-all duration-200 hover:bg-black/5 border-b border-black/5 last:border-b-0">
                        <div class="flex items-start space-x-4">
                            <!-- <div
                                class="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                                <UIcon name="i-tabler-map-pin" class="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600" />
                            </div> -->

                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-gray-900 truncate group-hover:text-gray-800">
                                    {{ suggestion.name }}
                                </p>
                                <p class="text-sm text-gray-500 mt-0.5 line-clamp-2 group-hover:text-gray-600">
                                    {{ suggestion.display_name }}
                                </p>
                            </div>

                            <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <UIcon name="i-tabler-arrow-up-right" class="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.4);
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.6);
}
</style>
