<script setup>
// IMPORTS //////////////////////

import { createMapService } from '~~/shared/services/map';
import { purchaseMap, validatePurchaseEligibility } from '~~/shared/services/mapPurchase';
import { getMapPurchaseCost } from '~~/data/credits';
import { useAuthStore } from '~~/stores/authStore';
import { createUser } from '~~/shared/services/user';
import { useCredits } from '~~/app/composables/useCredits';

// ROUTE & SERVICES //////////////////////

const route = useRoute();
const router = useRouter();
const mapId = route.query.uid;

const mapService = createMapService();
const authStore = useAuthStore();
const { t, locale } = useI18n();

// DATA //////////////////////

const mapData = ref(null);
const loading = ref(true);
const purchasing = ref(false);
const error = ref('');
const imageUrl = ref('');
const purchaseCost = ref(0);
const eligibility = ref(null);
const userCredits = ref(0);

// COMPUTED //////////////////////

const isUserAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const canPurchase = computed(() => eligibility.value?.canPurchase || false);

// FUNCTIONS //////////////////////

async function getMapData() {
    try {
        loading.value = true;
        error.value = '';

        if (!mapId) {
            error.value = t('Map ID is required');
            return;
        }

        // Get user credits
        if (user.value?.uid) {
            const userService = createUser();
            userCredits.value = await userService.getUserCredits(user.value.uid);
        }

        // Get map data
        const result = await mapService.getMap(mapId);

        if (!result.success || !result.data) {
            error.value = t('Map not found');
            return;
        }

        mapData.value = result.data;
        imageUrl.value = result.data?._references?.file_map_resized?.url || result.data?._references?.file_map?.url;

        // Calculate purchase cost
        purchaseCost.value = getMapPurchaseCost(result.data.quality);

        // Validate purchase eligibility
        if (user.value?.uid) {
            eligibility.value = await validatePurchaseEligibility(mapId, user.value.uid);
        }
    } catch (err) {
        console.error('Error fetching map data:', err);
        error.value = t('Error loading map');
    } finally {
        loading.value = false;
    }
}

async function processPurchase() {
    if (!user.value?.uid || !mapId) {
        error.value = t('User or map information missing');
        return;
    }

    try {
        purchasing.value = true;
        error.value = '';

        // Validate eligibility one more time
        const finalEligibility = await validatePurchaseEligibility(mapId, user.value.uid);
        if (!finalEligibility.canPurchase) {
            error.value = finalEligibility.reason || t('Cannot purchase this map');
            return;
        }

        // Process purchase
        const result = await purchaseMap(mapId, user.value.uid);

        if (!result.success) {
            error.value = result.message || t('Error purchasing map');
            return;
        }

        // Update credits in global state
        const { updateCredits } = useCredits();
        await updateCredits(user.value.uid);

        // Success - redirect to new map
        if (result.newMapId) {
            // Show success message briefly
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigateTo(`/${locale.value}/maps/${result.newMapId}`);
        }
    } catch (err) {
        console.error('Error processing purchase:', err);
        error.value = err instanceof Error ? err.message : t('Error processing purchase');
    } finally {
        purchasing.value = false;
    }
}

function goBack() {
    if (document.referrer) {
        window.history.back();
    } else {
        navigateTo(`/${locale.value}/maps/explore`);
    }
}

// SEO //////////////////////

useHead({
    title: `${t('Buy Map')} - Mappic`,
    meta: [{ name: 'description', content: t('Purchase a beautiful map') }],
});

// LIFECYCLE //////////////////////

onMounted(async () => {
    if (!isUserAuthenticated.value) {
        navigateTo('/auth/login');
        return;
    }

    await getMapData();
});
</script>

<template>
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <!-- Loading State -->
        <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center">
            <Loader />
        </div>

        <!-- Error State -->
        <div v-else-if="error && !mapData" class="w-full max-w-2xl">
            <CardComposition
                image-src="/opendoodles/clumsy.svg"
                :title="$t('Error')"
                :description="error">
                <UButton size="xl" block @click="goBack">
                    {{ $t('Go Back') }}
                </UButton>
            </CardComposition>
        </div>

        <!-- Purchase Form -->
        <template v-else-if="mapData">
            <div class="w-full max-w-4xl">
                <EffectGlass class="p-8 rounded-3xl" :displace="2">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-8">
                        <h1 class="text-3xl font-bold">{{ $t('Buy Map') }}</h1>
                        <UButton
                            icon="i-tabler-x"
                            color="neutral"
                            variant="ghost"
                            size="xl"
                            @click="goBack" />
                    </div>

                    <!-- Error Message -->
                    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p class="text-red-800">{{ error }}</p>
                    </div>

                    <!-- Map Preview -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <!-- Image -->
                        <div class="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden min-h-[300px]">
                            <img
                                v-if="imageUrl"
                                :src="imageUrl"
                                :alt="mapData.design?.title || 'Map'"
                                class="w-full h-full object-cover" />
                            <div v-else class="text-gray-400">{{ $t('No preview available') }}</div>
                        </div>

                        <!-- Details -->
                        <div class="flex flex-col justify-between">
                            <!-- Map Info -->
                            <div class="space-y-6">
                                <!-- Title -->
                                <div>
                                    <h2 class="text-2xl font-bold mb-2">
                                        {{ mapData.design?.title || $t('Untitled Map') }}
                                    </h2>
                                    <p v-if="mapData.suggestion?.display_name" class="text-gray-600">
                                        📍 {{ mapData.suggestion.display_name }}
                                    </p>
                                </div>

                                <!-- Map Details -->
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center py-2 border-b">
                                        <span class="text-gray-600">{{ $t('Quality') }}:</span>
                                        <span class="font-semibold capitalize">{{ mapData.quality }}</span>
                                    </div>
                                    <div v-if="mapData.design?.style" class="flex justify-between items-center py-2 border-b">
                                        <span class="text-gray-600">{{ $t('Style') }}:</span>
                                        <span class="font-semibold capitalize">{{ mapData.design.style }}</span>
                                    </div>
                                    <div v-if="mapData.design?.composition" class="flex justify-between items-center py-2 border-b">
                                        <span class="text-gray-600">{{ $t('Composition') }}:</span>
                                        <span class="font-semibold capitalize">{{ mapData.design.composition }}</span>
                                    </div>
                                </div>

                                <!-- Purchase Info -->
                                <div class="bg-blue-50 p-4 rounded-lg space-y-3">
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-700">{{ $t('Purchase Cost') }}:</span>
                                        <span class="text-2xl font-bold text-blue-600">{{ purchaseCost }} 💳</span>
                                    </div>
                                    <div class="flex justify-between items-center pt-2 border-t border-blue-200">
                                        <span class="text-gray-700">{{ $t('Credits') }}:</span>
                                        <span class="text-xl font-semibold" :class="userCredits >= purchaseCost ? 'text-green-600' : 'text-red-600'">
                                            {{ userCredits }} 💳
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-600">
                                        {{ $t('After purchase, this map will be added to your collection.') }}
                                    </p>
                                </div>
                            </div>

                            <!-- Purchase Button -->
                            <div class="mt-8 space-y-3">
                                <UButton
                                    v-if="canPurchase"
                                    block
                                    size="xl"
                                    color="primary"
                                    :loading="purchasing"
                                    @click="processPurchase">
                                    {{ $t('Confirm Purchase') }}
                                </UButton>
                                <UButton
                                    v-else
                                    block
                                    size="xl"
                                    color="neutral"
                                    variant="outline"
                                    disabled>
                                    {{ eligibility?.reason || $t('Cannot purchase') }}
                                </UButton>
                                <UButton
                                    block
                                    size="xl"
                                    color="neutral"
                                    variant="outline"
                                    @click="goBack">
                                    {{ $t('Cancel') }}
                                </UButton>
                            </div>
                        </div>
                    </div>
                </EffectGlass>
            </div>
        </template>
    </div>
</template>

<style scoped></style>
