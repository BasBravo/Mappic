<script setup>
import { capitalize, sleep } from '~~/helpers';
import { styles, compositions } from '~~/data/design';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMapStore } from '~~/stores/mapStore';

const mapStore = useMapStore();
const router = useRouter();

// Props
const props = defineProps({
    mapBaseRef: {
        type: Object,
        default: null,
    },
});

// Dimensiones personalizadas
const customWidth = ref(50);
const customHeight = ref(70);
const isCustomSize = ref(false);

// Tamaños de marcos de IKEA más populares (ancho x alto en cm)
const frameSizes = [
    { key: '21x30', label: '21×30 cm', aspect: '21:30' },
    { key: '30x40', label: '30×40 cm', aspect: '30:40' },
    { key: '40x50', label: '40×50 cm', aspect: '40:50' },
    { key: '50x70', label: '50×70 cm', aspect: '50:70' },
    { key: '61x91', label: '61×91 cm', aspect: '61:91' },
    { key: '70x100', label: '70×100 cm', aspect: '70:100' },
    { key: '50x50', label: '50×50 cm (cuadrado)', aspect: '50:50' },
    { key: '30x30', label: '30×30 cm (cuadrado)', aspect: '30:30' },
];

// Panel states
const showStylePanel = ref(false);
const showCustomizePanel = ref(false);

// Z-index management - usar valores más estables
const baseZIndex = 100;
const maxZIndex = ref(baseZIndex);
const stylePanelZIndex = ref(baseZIndex + 1);
const customizePanelZIndex = ref(baseZIndex + 2);

const changeStyle = styleKey => {
    mapStore.setSelectedStyle(styleKey);
};
const changeComposition = compositionKey => {
    mapStore.setSelectedComposition(compositionKey);
};

function goHomeAndReset() {
    router.push('/');
}

function generate() {
    router.push('/maps/generate');
}

// Zoom functions
function zoomIn() {
    if (props.mapBaseRef && props.mapBaseRef.zoomIn) {
        props.mapBaseRef.zoomIn();
    }
}

function zoomOut() {
    if (props.mapBaseRef && props.mapBaseRef.zoomOut) {
        props.mapBaseRef.zoomOut();
    }
}

function closeAllPanels() {
    showStylePanel.value = false;
    showCustomizePanel.value = false;
}

function openStylePanel() {
    closeAllPanels();
    showStylePanel.value = true;
}

function openCustomizePanel() {
    closeAllPanels();
    showCustomizePanel.value = true;
}

function closeStylePanel() {
    showStylePanel.value = false;
}

function closeCustomizePanel() {
    showCustomizePanel.value = false;
}

function focusStylePanel() {
    maxZIndex.value += 1;
    stylePanelZIndex.value = maxZIndex.value;
}

function focusCustomizePanel() {
    maxZIndex.value += 1;
    customizePanelZIndex.value = maxZIndex.value;
}

function selectFrameSize(size) {
    // Marcar que no es un tamaño personalizado PRIMERO
    isCustomSize.value = false;

    // Actualizar el aspect ratio en el design del mapa
    mapStore.mapAspect = size.aspect;

    // Actualizar las dimensiones personalizadas para reflejar la selección
    const [width, height] = size.aspect.split(':').map(Number);
    customWidth.value = width;
    customHeight.value = height;
}

function updateCustomSize() {
    // Solo actualizar si realmente es un cambio personalizado
    // (no cuando se está seleccionando un tamaño predefinido)
    if (isCustomSize.value) {
        // Usar nextTick para asegurar que los valores están actualizados
        nextTick(() => {
            // Crear el aspect ratio desde las dimensiones personalizadas
            const aspect = `${customWidth.value}:${customHeight.value}`;
            mapStore.mapAspect = aspect;

            console.log('updateCustomSize:', {
                width: customWidth.value,
                height: customHeight.value,
                aspect: aspect,
            });
        });
    }
}

// Inicializar dimensiones personalizadas desde el store
function initCustomDimensions() {
    if (mapStore.mapAspect) {
        const [width, height] = mapStore.mapAspect.split(':').map(Number);
        customWidth.value = width;
        customHeight.value = height;

        // Verificar si es un tamaño predefinido o personalizado
        const isPreset = frameSizes.some(size => size.aspect === mapStore.mapAspect);
        isCustomSize.value = !isPreset;
    }
}

// Watchers para dimensiones personalizadas
watch(
    [customWidth, customHeight],
    () => {
        // Solo marcar como personalizado si el usuario está editando manualmente
        // (después de que se haya inicializado el componente)
        if (import.meta.client) {
            // Verificar si las dimensiones actuales coinciden con algún tamaño predefinido
            const currentAspect = `${customWidth.value}:${customHeight.value}`;
            const isPreset = frameSizes.some(size => size.aspect === currentAspect);

            // Si no coincide con ningún preset, entonces es personalizado
            if (!isPreset && !isCustomSize.value) {
                isCustomSize.value = true;
            }
        }

        updateCustomSize();
    },
    { flush: 'post' }
);

// Inicializar al montar el componente
onMounted(() => {
    initCustomDimensions();
});
</script>

<template>
    <div class="flex gap-3 items-center">
        <EffectGlass class="flex gap-2 p-1 rounded-full" :displace="2">
            <UButton icon="i-tabler-arrow-left" variant="ghost" color="primary" size="xl" @click="goHomeAndReset" />
        </EffectGlass>
        <EffectGlass class="flex gap-2 p-1 rounded-full" :displace="2">
            <UButton icon="i-tabler-plus" variant="ghost" color="primary" size="xl" @click="zoomIn" />
            <UButton icon="i-tabler-minus" variant="ghost" color="primary" size="xl" @click="zoomOut" />
        </EffectGlass>
        <EffectGlass class="flex gap-2 p-1 rounded-full" :displace="2">
            <UButton :label="$t('Change style')" variant="ghost" color="primary" size="xl" @click="openStylePanel" />
            <UButton :label="$t('Customize')" variant="ghost" color="primary" size="xl" @click="openCustomizePanel" />
            <div class="w-2"></div>
            <UButton :label="$t('Generate')" icon="i-tabler-wand" color="primary" size="xl" @click="generate()" />
        </EffectGlass>
    </div>

    <!-- Style Panel -->
    <PanelDraggable
        v-if="showStylePanel"
        :title="$t('Change style')"
        :initial-x="100"
        :initial-y="100"
        :min-width="500"
        :max-width="700"
        :z-index="stylePanelZIndex"
        @close="closeStylePanel"
        @focus="focusStylePanel">
        <div class="flex flex-col gap-4 text-black">
            <label class="font-medium text-lg flex">
                {{ capitalize($t('style')) }}
            </label>
            <!-- loop styles -->
            <div class="flex w-full gap-2 custom-scrollbar overflow-auto">
                <div
                    v-for="(item, index) in styles"
                    :key="'style-' + index"
                    class="w-20 min-w-20 flex flex-col items-center gap-0 cursor-pointer"
                    @click="changeStyle(item.key)">
                    <div
                        class="rounded-lg overflow-hidden border-2 p-0.5 transition-colors"
                        :class="[mapStore.selectedStyle == item.key ? 'border-gray-950' : 'border-gray-200']">
                        <img :src="item.src" class="w-full h-auto rounded" />
                    </div>
                    <span class="text-sm truncate w-full text-center pt-0.5">{{ $t(item.value) }}</span>
                </div>
            </div>
            <div />
            <label class="font-medium text-lg flex">
                {{ capitalize($t('composition')) }}
            </label>
            <!-- loop compositions -->
            <div class="flex w-full gap-2 custom-scrollbar overflow-auto">
                <div
                    v-for="(item, index) in compositions"
                    :key="'composition-' + index"
                    class="w-20 min-w-20 flex flex-col items-center gap-0 cursor-pointer"
                    @click="changeComposition(item.key)">
                    <div
                        class="rounded-lg overflow-hidden border-2 p-0.5 transition-colors"
                        :class="[mapStore.selectedComposition == item.key ? 'border-gray-950' : 'border-gray-200']">
                        <img :src="item.src" class="w-20 border border-gray-400 h-auto rounded" />
                    </div>
                    <span class="text-sm truncate w-full text-center pt-0.5">{{ capitalize($t(item.key)) }}</span>
                </div>
            </div>
        </div>
    </PanelDraggable>

    <!-- Customize Panel -->
    <PanelDraggable
        v-if="showCustomizePanel"
        :title="$t('Customize')"
        :initial-x="150"
        :initial-y="120"
        :min-width="400"
        :max-width="400"
        :z-index="customizePanelZIndex"
        @close="closeCustomizePanel"
        @focus="focusCustomizePanel">
        <UForm class="flex flex-col gap-4 w-full">
            <UFormField :label="$t('Title')">
                <UInput class="w-full" v-model="mapStore.mapTitle" placeholder="Ej: Mi mapa personalizado" size="xl" />
            </UFormField>
            <UFormField :label="$t('Title size')" class="relative">
                <USlider v-model="mapStore.mapTitleSize" :min="0" :max="100" :step="1" :default-value="50" size="lg" color="primary" />
                <div class="absolute right-0 -top-6 text-sm text-gray-600">{{ mapStore.mapTitleSize }}%</div>
            </UFormField>
            <UFormField :label="$t('Subtitle')">
                <UInput class="w-full" v-model="mapStore.mapSubtitle" placeholder="Ej: Un lugar especial" size="xl" />
            </UFormField>
            <UFormField :label="$t('Subtitle size')" class="relative">
                <USlider v-model="mapStore.mapSubtitleSize" :min="0" :max="100" :step="1" :default-value="50" size="lg" color="primary" />
                <div class="absolute right-0 -top-6 text-sm text-gray-600">{{ mapStore.mapSubtitleSize }}%</div>
            </UFormField>
            <UFormField :label="$t('Show info')">
                <USwitch v-model="mapStore.showInfo" size="lg" color="primary" />
            </UFormField>
            <UFormField v-if="mapStore.showInfo" :label="$t('Custom info')">
                <UTextarea
                    v-model="mapStore.customInfo"
                    class="w-full"
                    :placeholder="$t('Enter custom info to override default location info')"
                    :rows="3"
                    size="xl" />
            </UFormField>

            <UFormField :label="$t('Frame size')">
                <template #hint>
                    <USwitch v-model="mapStore.mapLandscape" size="xs" color="primary">
                        <template #label>
                            {{ $t('Landscape') }}
                        </template>
                    </USwitch>
                </template>
                <div class="grid grid-cols-2 gap-2 mt-2">
                    <button
                        v-for="size in frameSizes"
                        :key="size.key"
                        @click="selectFrameSize(size)"
                        :class="[
                            'px-3 py-2 text-sm rounded-lg border-2 transition-colors',
                            mapStore.mapAspect === size.aspect && !isCustomSize
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 bg-white hover:border-black text-black',
                        ]">
                        {{ size.label }}
                    </button>
                </div>
            </UFormField>

            <UFormField :label="$t('Custom dimensions (cm)')">
                <div class="grid grid-cols-2 gap-3">
                    <UInput v-model="customWidth" class="not-numeric-controls w-full" type="number" :min="10" :max="200" size="lg">
                        <template #trailing>
                            <span class="text-gray-400 uppercase text-xs">{{ $t('Width cm') }}</span>
                        </template>
                    </UInput>
                    <UInput v-model="customHeight" class="not-numeric-controls w-full" type="number" :min="10" :max="200" size="lg">
                        <template #trailing>
                            <span class="text-gray-400 uppercase text-xs">{{ $t('Height cm') }}</span>
                        </template>
                    </UInput>
                </div>
            </UFormField>
        </UForm>
    </PanelDraggable>
</template>

<style>
/* Oculta las flechas de los inputs number en Chrome, Safari, Edge, Opera */
.not-numeric-controls input[type='number']::-webkit-inner-spin-button,
.not-numeric-controls input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
/* Oculta las flechas en Firefox */
.not-numeric-controls input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
}
</style>
