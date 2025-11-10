<script setup>
import { z } from 'zod';
import { useMapStore } from '~~/stores/mapStore';
import { createApi } from '~~/shared/services/api';
import { createMapService } from '~~/shared/services/map';
import { createUser } from '~~/shared/services/user';
import { canGenerateMap as canUserGenerateMap, mapGenerationCosts } from '~~/data/credits';
import { styles } from '~~/data/design';
import { useAuthStore } from '~~/stores/authStore';
import ModalCredits from '~/components/ModalCredits.vue';

const { t, locale } = useI18n();
const mapStore = useMapStore();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const authStore = useAuthStore();

const apiService = createApi();
const mapService = createMapService();
const userService = createUser();

// Use the credits composable
const { credits: userCredits, updateCredits, deductCredits, getGuestUid } = useCredits();

const PPI = 300;
const ZOOM_LEVEL = 12;

const loading = ref(false);
const loadingCredits = ref(true);
const showCreditsModal = ref(false);
const showAdjustModal = ref(false);
const mapBaseRef = ref(null);
const formRef = ref(null);
const formErrors = ref({});

const dimensionConfigs = [
    {
        key: 'low',
        value: 0,
        labelKey: 'Small',
        resolutionKey: 'low',
        code: 's',
        credits: mapGenerationCosts.s.cost,
        maxPxSize: mapGenerationCosts.s.maxPxSize,
        width: 1535,
        height: 2047,
        cm: { width: 13, height: 17.3 },
        in: { width: 5.1, height: 6.8 },
        composition: 'all',
    },
    {
        key: 'medium',
        value: 1,
        labelKey: 'Medium',
        resolutionKey: 'medium',
        code: 'm',
        credits: mapGenerationCosts.m.cost,
        maxPxSize: mapGenerationCosts.m.maxPxSize,
        width: 3543,
        height: 4724,
        cm: { width: 30, height: 40 },
        in: { width: 11.8, height: 15.7 },
        composition: 'all',
    },
    {
        key: 'high',
        value: 2,
        labelKey: 'High',
        resolutionKey: 'high',
        code: 'l',
        credits: mapGenerationCosts.l.cost,
        maxPxSize: mapGenerationCosts.l.maxPxSize,
        width: 5906,
        height: 7874,
        cm: { width: 50, height: 66.7 },
        in: { width: 19.7, height: 26.2 },
        composition: 'all',
    },
    {
        key: 'superhigh',
        value: 3,
        labelKey: 'Superhigh',
        resolutionKey: 'superhigh',
        code: 'xl',
        credits: mapGenerationCosts.xl.cost,
        maxPxSize: mapGenerationCosts.xl.maxPxSize,
        width: 8858,
        height: 11811,
        cm: { width: 75, height: 100 },
        in: { width: 29.5, height: 39.4 },
        composition: 'all',
    },
    {
        key: 'ultrahigh',
        value: 4,
        labelKey: 'Ultrahigh',
        resolutionKey: 'ultrahigh',
        code: 'xxl',
        credits: mapGenerationCosts.xxl.cost,
        maxPxSize: mapGenerationCosts.xxl.maxPxSize,
        width: 11811,
        height: 15748,
        cm: { width: 100, height: 133.3 },
        in: { width: 39.4, height: 52.5 },
        composition: 'all',
    },
];

const dimensions = computed(() => {
    // Filter dimensions based on composition
    const filteredConfigs = dimensionConfigs.filter(config => {
        if (config.composition === 'all') return true;
        if (config.composition === 'clean' && mapStore.selectedComposition === 'clean') return true;
        return false;
    });

    // Calculate required pixel size based on user's custom dimensions
    let requiredPixelSize = 0;
    if (mapStore.mapAspect && mapStore.mapAspect !== '5:7') {
        const [aspectWidth, aspectHeight] = mapStore.mapAspect.split(':').map(Number);
        const isLandscape = mapStore.mapLandscape;

        // Apply landscape orientation
        const finalWidth = isLandscape ? aspectHeight : aspectWidth;
        const finalHeight = isLandscape ? aspectWidth : aspectHeight;

        // Convert custom cm dimensions to px
        const widthPx = cmToPx(finalWidth);
        const heightPx = cmToPx(finalHeight);

        // Get the maximum dimension
        requiredPixelSize = Math.max(widthPx, heightPx);
    }

    // Filter configs intelligently - only show options up to the one that covers user's dimensions
    let smartFilteredConfigs = [];
    if (requiredPixelSize > 0) {
        // Find the first config that can handle the required size
        for (const config of filteredConfigs) {
            smartFilteredConfigs.push(config);
            // Stop adding configs once we find one that can handle the required size
            if (config.maxPxSize >= requiredPixelSize) {
                break;
            }
        }
    } else {
        // If no custom dimensions, show all available configs
        smartFilteredConfigs = filteredConfigs;
    }

    // Map filtered configs with labels and reassign values sequentially
    return smartFilteredConfigs.map((config, index) => ({
        ...config,
        value: index, // Reassign sequential values starting from 0
        label: t(config.labelKey).toUpperCase() + ' - ' + config.credits + ' ' + t('credits') + ' (max ' + config.maxPxSize + 'px)',
    }));
});

const data = reactive({
    dimension: 0,
    email: '',
    conditions: false,
    ticket: '',
    uid: '',
    user: null,
});

const schemaMap = computed(() => {
    const schema = {
        dimension: z.number(),
    };

    // Solo requerir email y conditions si el usuario no está autenticado
    if (!isUserAuthenticated.value) {
        schema.email = z.string().email({ message: t('email invalid') });
        schema.conditions = z.boolean().refine(value => value === true, { message: t('accept conditions') });
    }

    return z.object(schema).passthrough();
});

function cmToPx(cm) {
    const inches = cm / 2.54;
    return inches * PPI;
}

// Calculate adjusted dimensions based on credit restrictions
function calculateAdjustedDimensions(selectedDimension) {
    const creditLimit = mapGenerationCosts[selectedDimension.code];
    if (!creditLimit) return { width: selectedDimension.width, height: selectedDimension.height, adjusted: false };

    const maxPxSize = creditLimit.maxPxSize;
    let { width, height } = selectedDimension;

    // If user has custom dimensions from mapStore
    if (mapStore.mapAspect && mapStore.mapAspect !== '5:7') {
        const [aspectWidth, aspectHeight] = mapStore.mapAspect.split(':').map(Number);
        const isLandscape = mapStore.mapLandscape;

        // Apply landscape orientation
        const finalWidth = isLandscape ? aspectHeight : aspectWidth;
        const finalHeight = isLandscape ? aspectWidth : aspectHeight;

        // Convert custom cm dimensions to px
        width = cmToPx(finalWidth);
        height = cmToPx(finalHeight);
    }

    // Check if adjustment is needed (max dimension exceeds limit)
    const maxDimension = Math.max(width, height);
    if (maxDimension <= maxPxSize) {
        return { width, height, adjusted: false, originalWidth: width, originalHeight: height };
    }

    // Calculate scale factor to fit within credit limit
    const scaleFactor = maxPxSize / maxDimension;
    const adjustedWidth = Math.round(width * scaleFactor);
    const adjustedHeight = Math.round(height * scaleFactor);

    return {
        width: adjustedWidth,
        height: adjustedHeight,
        adjusted: true,
        originalWidth: width,
        originalHeight: height,
        scaleFactor,
        maxPxSize,
    };
}

async function checkUserCredits() {
    try {
        loadingCredits.value = true;
        // Use the composable to update credits, passing the UID if user is authenticated
        const uid = isUserAuthenticated.value ? authenticatedUser.value?.uid : undefined;
        await updateCredits(uid);
        console.log('Updated credits via composable:', userCredits);
    } catch (error) {
        console.error('Error checking user credits:', error);
    } finally {
        loadingCredits.value = false;
    }
}

function createMapDesign() {
    return {
        title: mapStore.mapTitle,
        titleSize: mapStore.mapTitleSize,
        subTitle: mapStore.mapSubtitle,
        subTitleSize: mapStore.mapSubtitleSize,
        style: mapStore.selectedStyle,
        composition: mapStore.selectedComposition,
        showInfo: mapStore.showInfo,
        customInfo: mapStore.customInfo,
    };
}

function createRequestBody(result, design, bounds) {
    const selectedDimension = dimensions.value[data.dimension];
    const adjusted = adjustedDimensions.value;

    return {
        rootUrl: runtimeConfig.public.baseUrl || 'http://localhost:3000',
        uid: result.uid,
        bounds,
        design,
        style_id: styles.find(s => s.key === mapStore.selectedStyle)?.id || 'clw62ax0302qk01oc3ush3t7c',
        style_username: 'basbravo',
        width: adjusted.width,
        height: adjusted.height,
        email: data.email,
        lang: locale.value,
        format: 'portrait',
        user: data.user,
        quality: selectedDimension.key,
        zoom: ZOOM_LEVEL,
        credits_used: requiredCredits.value,
        ticket: data.ticket,
    };
}

async function validateForm() {
    try {
        formErrors.value = {};
        console.log('Validating form data:', data);
        console.log('Schema:', schemaMap.value);
        console.log('Is user authenticated:', isUserAuthenticated.value);
        await schemaMap.value.parseAsync(data);
        console.log('Validation passed!');
        return true;
    } catch (error) {
        console.error('Validation failed:', error);
        console.error('Error details:', error.errors);
        if (error.errors) {
            error.errors.forEach(err => {
                formErrors.value[err.path[0]] = err.message;
                console.error(`Field ${err.path[0]}: ${err.message}`);
            });
        }
        return false;
    }
}

async function generateMap() {
    // Validar el formulario antes de proceder
    const isValid = await validateForm();

    if (!isValid) {
        return;
    }

    loading.value = true;

    try {
        // Usar el email del usuario autenticado o el del formulario
        const emailToUse = isUserAuthenticated.value ? authenticatedUser.value?.email : data.email.trim();
        data.email = emailToUse;
        data.ticket = Math.random().toString(36).substring(2, 8);

        if (!mapStore.selectedLocation) {
            throw new Error('No location selected');
        }

        const coords = mapStore.locationCoordinates;
        if (!coords) {
            throw new Error('Invalid coordinates');
        }

        const selectedDimension = dimensions.value[data.dimension];
        const adjusted = adjustedDimensions.value;

        // Check if user has enough credits using the data function
        if (!canUserGenerateMap(userCredits.value, selectedDimension.code)) {
            throw new Error('Not enough credits');
        }

        data.user = isUserAuthenticated.value ? authenticatedUser.value?.uid : null;
        const mapDesign = createMapDesign();
        const bounds = mapStore.mapBounds;

        const dataForSave = {
            design: mapDesign,
            suggestion: mapStore.selectedLocation,
            zoom: ZOOM_LEVEL,
            bounds,
            email: emailToUse.toLowerCase(),
            status: 'processing',
            in_progress: true,
            ticket: data.ticket,
            width: adjusted.width,
            height: adjusted.height,
            quality: selectedDimension.key,
            format: 'portrait', //calculateFormat(),
            user: data.user ? 'users/' + data.user : null,
            credits_used: requiredCredits.value,
        };

        const result = await mapService.save(dataForSave);

        if (!result.success || !result.uid) {
            throw new Error(result.message || 'Failed to save map');
        }

        data.uid = result.uid;

        if (mapDesign.showInfo && mapStore.selectedLocation) {
            mapDesign.info = {
                coordinates: {
                    latitude: coords.lat,
                    longitude: coords.lon,
                },
                full_address: mapStore.selectedLocation.display_name,
            };
        }

        const bodyToSend = createRequestBody(result, mapDesign, bounds);

        // Deduct credits from user (using authenticated UID or guest UID)
        const uidToUse = isUserAuthenticated.value ? authenticatedUser.value?.uid : await getGuestUid();
        const deductResult = await deductCredits(uidToUse, requiredCredits.value);
        if (!deductResult.success) {
            throw new Error('Failed to deduct credits');
        }

        // Process the map
        const url = runtimeConfig.public.functionsUrl + '/mappic/save';
        apiService.request(url, {
            method: 'POST',
            body: bodyToSend,
        });

        // Limpiar el MapStore
        mapStore.clearLocation();

        // Redirigir a la página del ticket
        router.push(`/maps/tickets/${data.ticket}`);
    } catch (error) {
        console.error('Error generating map:', error);
        // Here you could show a toast notification or error message
    } finally {
        loading.value = false;
    }
}

function goBack() {
    router.push('/maps/editor');
}

function createNew() {
    router.push('/');
}

function openCreditsModal() {
    showCreditsModal.value = true;
}

const selectedDimension = computed(() => dimensions.value[data.dimension]);

const requiredCredits = computed(() => {
    return selectedDimension.value?.credits || 2;
});

const isUserAuthenticated = computed(() => authStore.isAuthenticated);
const authenticatedUser = computed(() => authStore.user);

const hasEnoughCredits = computed(() => {
    const result = canUserGenerateMap(userCredits.value, selectedDimension.value?.code || 's');
    console.log('hasEnoughCredits check:', {
        userCredits: userCredits.value,
        selectedDimensionCode: selectedDimension.value?.code,
        requiredCredits: requiredCredits.value,
        result,
    });
    return result;
});

const adjustedDimensions = computed(() => {
    return calculateAdjustedDimensions(selectedDimension.value);
});

const dimensionInfo = computed(() => {
    const adjusted = adjustedDimensions.value;

    // Calculate cm and inches based on pixel dimensions at 300 PPI
    function pxToCm(px) {
        const inches = px / PPI;
        return (inches * 2.54).toFixed(1);
    }

    function pxToInches(px) {
        return (px / PPI).toFixed(1);
    }

    const adjustedWidthCm = pxToCm(adjusted.width);
    const adjustedHeightCm = pxToCm(adjusted.height);
    const adjustedWidthIn = pxToInches(adjusted.width);
    const adjustedHeightIn = pxToInches(adjusted.height);

    // Original dimensions in cm and inches (if adjusted)
    const originalWidthCm = adjusted.adjusted ? pxToCm(adjusted.originalWidth) : null;
    const originalHeightCm = adjusted.adjusted ? pxToCm(adjusted.originalHeight) : null;
    const originalWidthIn = adjusted.adjusted ? pxToInches(adjusted.originalWidth) : null;
    const originalHeightIn = adjusted.adjusted ? pxToInches(adjusted.originalHeight) : null;

    return {
        pixels: `${adjusted.width.toFixed(0)} x ${adjusted.height.toFixed(0)} px`,
        centimeters: `${adjustedWidthCm} x ${adjustedHeightCm} cm`,
        inches: `${adjustedWidthIn} x ${adjustedHeightIn} in`,
        adjusted: adjusted.adjusted,
        originalPixels: adjusted.adjusted ? `${adjusted.originalWidth.toFixed(0)} x ${adjusted.originalHeight.toFixed(0)} px` : null,
        originalCentimeters: adjusted.adjusted ? `${originalWidthCm} x ${originalHeightCm} cm` : null,
        originalInches: adjusted.adjusted ? `${originalWidthIn} x ${originalHeightIn} in` : null,
        scaleFactor: adjusted.scaleFactor,
        maxPxSize: adjusted.maxPxSize,
    };
});

// No need to watch email changes since credits are based on UID, not email

// Watch for authentication changes and update credits accordingly
watch(
    [isUserAuthenticated, authenticatedUser],
    async () => {
        await checkUserCredits();
    },
    { immediate: false }
);

// Watch for composition and dimension changes and auto-select optimal dimension
watch(
    [() => mapStore.selectedComposition, () => mapStore.mapAspect, () => mapStore.mapLandscape],
    () => {
        // Calculate required pixel size based on user's custom dimensions
        let requiredPixelSize = 0;
        if (mapStore.mapAspect && mapStore.mapAspect !== '5:7') {
            const [aspectWidth, aspectHeight] = mapStore.mapAspect.split(':').map(Number);
            const isLandscape = mapStore.mapLandscape;

            // Apply landscape orientation
            const finalWidth = isLandscape ? aspectHeight : aspectWidth;
            const finalHeight = isLandscape ? aspectWidth : aspectHeight;

            // Convert custom cm dimensions to px
            const widthPx = cmToPx(finalWidth);
            const heightPx = cmToPx(finalHeight);

            // Get the maximum dimension
            requiredPixelSize = Math.max(widthPx, heightPx);
        }

        // Find the optimal dimension that covers user's requirements
        let optimalIndex = 0;
        if (requiredPixelSize > 0) {
            // Find the first option that can handle the required size
            const availableOptions = dimensions.value;
            for (let i = 0; i < availableOptions.length; i++) {
                if (availableOptions[i].maxPxSize >= requiredPixelSize) {
                    optimalIndex = i;
                    break;
                }
                // If no option can handle it, select the last available option
                optimalIndex = i;
            }
        }

        // Set the optimal dimension, but only if current selection is not available
        const currentDimension = dimensions.value[data.dimension];
        if (!currentDimension) {
            data.dimension = optimalIndex;
        } else {
            // If user hasn't manually changed from default, update to optimal
            // This allows automatic selection while preserving user choice
            data.dimension = optimalIndex;
        }
    },
    { immediate: true }
);

// Limpiar errores cuando el usuario modifica los campos
watch(
    () => data.email,
    () => {
        if (formErrors.value.email) {
            delete formErrors.value.email;
        }
    }
);

watch(
    () => data.conditions,
    () => {
        if (formErrors.value.conditions) {
            delete formErrors.value.conditions;
        }
    }
);

watch(
    () => data.dimension,
    () => {
        if (formErrors.value.dimension) {
            delete formErrors.value.dimension;
        }
    }
);

onMounted(async () => {
    await checkUserCredits();
});
</script>

<template>
    <div class="w-full min-h-[calc(100dvh-4rem)] md:-translate-x-12">
        <!-- Credits Modal -->
        <ModalCredits v-model="showCreditsModal" :required-credits="requiredCredits" :show-requirement="true" />

        <!-- Adjustment warning -->
        <ElementsModal v-if="dimensionInfo.adjusted" v-model:open="showAdjustModal" :title="$t('Size adjusted due to credit limit')">
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <span>
                        {{ $t('The size of your map has been automatically reduced to fit within your current credit limit.') }}
                    </span>
                </div>
                <div class="overflow-hidden rounded-lg border border-gray-200">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-3 py-2 text-left font-medium"></th>
                                <th class="px-3 py-2 text-center font-medium">{{ $t('Original') }}</th>
                                <th class="px-3 py-2 text-center font-medium">{{ $t('Adjusted') }}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr class="bg-gray-50">
                                <td class="px-3 py-2 font-medium">{{ $t('Size (pixels)') }}</td>
                                <td class="px-3 py-2 font-bold">{{ dimensionInfo.originalPixels }}</td>
                                <td class="px-3 py-2 font-bold">{{ dimensionInfo.pixels }}</td>
                            </tr>
                            <tr>
                                <td class="px-3 py-2 font-medium">{{ $t('Size (cm)') }}</td>
                                <td class="px-3 py-2 font-bold">{{ dimensionInfo.originalCentimeters }}</td>
                                <td class="px-3 py-2 font-bold">{{ dimensionInfo.centimeters }}</td>
                            </tr>
                            <tr class="bg-gray-50">
                                <td class="px-3 py-2 font-medium">{{ $t('Size (inches)') }}</td>
                                <td class="px-3 py-2 font-bold">{{ dimensionInfo.originalInches }}</td>
                                <td class="px-3 py-2 font-bold">{{ dimensionInfo.inches }}</td>
                            </tr>
                            <tr>
                                <td class="px-3 py-2 font-medium">{{ $t('Scale factor') }}</td>
                                <td class="px-3 py-2 font-bold">100%</td>
                                <td class="px-3 py-2 font-bold">{{ Math.round((dimensionInfo.scaleFactor || 1) * 100) }}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div class="text-sm text-red-800">
                        <strong>{{ $t('Credit limit') }}:</strong>
                        {{ $t('Maximum') }} {{ dimensionInfo.maxPxSize }}px {{ $t('for') }} {{ selectedDimension.credits }}
                        {{ $t('credits') }}
                    </div>
                </div>
                <div>
                    {{
                        $t(
                            'To generate a larger map, you will need more credits. You can get more credits and try again if you want a higher resolution.'
                        )
                    }}
                </div>
            </div>
        </ElementsModal>

        <div class="flex flex-col lg:flex-row w-full md:h-full gap-20 p-10 px-20 justify-center">
            <!-- Vista previa del mapa -->
            <div class="h-[400px] md:h-full w-full md:max-w-[450px] flex items-center justify-center relative">
                <div class="w-full h-full flex items-center justify-center">
                    <MapBase ref="mapBaseRef" :min-height="300" :min-width="200" :animation="false" :editable="false" />
                </div>
            </div>

            <!-- Formulario -->
            <div class="w-full md:max-w-[350px] md:h-full flex flex-col items-center justify-center gap-6">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <p>
                            <span>
                                {{
                                    $t(
                                        'Be sure that the result will be worth it. You will have a map ready to print with the quality you selected.'
                                    )
                                }}
                            </span>
                            <br />
                            <span v-if="dimensionInfo.adjusted">
                                {{ $t('The resolution you have defined is') }} {{ dimensionInfo.originalPixels }}
                            </span>
                            <span v-else>{{ $t('The resolution you have defined is') }} {{ dimensionInfo.pixels }}.</span>
                            <span>&nbsp;{{ $t('Estimated size for a 300 ppi print') }}</span>
                        </p>
                    </div>

                    <UForm ref="formRef" :state="data" :schema="schemaMap" class="flex flex-col gap-4">
                        <UFormField :label="$t('Choose the size of your map')" name="dimension" size="xl" :error="formErrors.dimension">
                            <USelect
                                v-model="data.dimension"
                                :items="dimensions"
                                class="w-full"
                                value-key="value"
                                text-key="label"
                                size="xl"
                                :placeholder="$t('Select size')" />
                        </UFormField>

                        <!-- Credits Info -->

                        <div v-if="!hasEnoughCredits" class="mt-2 text-sm text-red-600">
                            {{ $t('You have') }} {{ userCredits }} {{ $t('credits') }}, {{ $t('but you need') }} {{ requiredCredits }}
                            {{ $t('to generate this map') }}.
                        </div>

                        <!-- Solo mostrar el campo email si el usuario no está autenticado -->
                        <UFormField v-if="!isUserAuthenticated" :label="$t('Email')" name="email" size="xl" :error="formErrors.email">
                            <UInput v-model="data.email" class="w-full" :placeholder="$t('Insert your email')" type="email" size="xl" />
                        </UFormField>

                        <!-- Dimensions -->
                        <div class="flex flex-col gap-4 border bg-black rounded-2xl p-4">
                            <div class="flex flex-col">
                                <p class="mb-2 text-gray-200">
                                    {{ $t('The final file will be like this') }}
                                </p>
                                <p class="text-gray-200">
                                    {{ dimensionInfo.pixels }}
                                </p>
                                <p class="text-xs text-gray-400">{{ dimensionInfo.centimeters }} | {{ dimensionInfo.inches }}</p>
                            </div>

                            <div v-if="dimensionInfo.adjusted" class="relative">
                                <UIcon name="i-tabler-alert-square-rounded-filled" class="absolute -top-3 -right-1 text-xl text-red-500" />
                                <UButton
                                    block
                                    :label="$t('Why has this size changed?')"
                                    class="bg-white/20 hover:bg-white/30 text-white"
                                    size="sm"
                                    @click="showAdjustModal = true" />
                            </div>
                        </div>

                        <UFormField v-if="!isUserAuthenticated" name="conditions" :error="formErrors.conditions">
                            <UCheckbox v-model="data.conditions" :label="$t('i accept the terms of service')" size="xl" />
                        </UFormField>

                        <div class="fixed left-0 right-0 flex justify-center bottom-0 translate-y-3 z-10">
                            <div class="flex gap-3 items-center">
                                <EffectGlass class="flex gap-2 p-1 rounded-full" :displace="2">
                                    <UButton icon="i-tabler-arrow-left" variant="ghost" size="xl" @click="goBack" />
                                </EffectGlass>
                                <EffectGlass class="flex gap-2 p-1 rounded-full" :displace="2">
                                    <UButton
                                        v-if="hasEnoughCredits"
                                        type="submit"
                                        icon="i-tabler-wand"
                                        size="xl"
                                        :loading="loading || loadingCredits"
                                        :label="$t('Generate now')"
                                        @click="generateMap" />
                                    <UButton
                                        v-else
                                        type="button"
                                        icon="i-tabler-credit-card"
                                        size="xl"
                                        color="error"
                                        :label="$t('Get more credits')"
                                        @click="openCreditsModal" />
                                </EffectGlass>
                            </div>
                        </div>
                    </UForm>
                </div>
            </div>
        </div>

        <!-- <div class="md:hidden w-full h-full">
            <div class="flex flex-col items-center justify-center h-full">
                <p class="text-gray-500 text-lg">{{ $t('Map editor not available on mobile') }}</p>
                <p class="text-gray-400 text-sm">{{ $t('Please use a desktop browser to access the map editor.') }}</p>
            </div>
        </div> -->
    </div>
</template>
