<script setup>
import { createApi } from '~~/shared/services/api';
import { createUser } from '~~/shared/services/user';
import { creditPurchasePacks } from '~~/data/credits';
import { useAuthStore } from '~~/stores/authStore';

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const authStore = useAuthStore();

// Services
const apiService = createApi();
const userService = createUser();

// Reactive state
const loading = ref(true);
const success = ref(false);
const error = ref(false);
const errorMessage = ref('');
const creditsAdded = ref(0);
const packPurchased = ref(null);

// Get session ID from URL query params - try multiple possible parameter names
const sessionId = route.query.session_id || route.query.session || route.query.sessionId || route.query.checkout_session_id;

// Meta tags
useHead({
    title: 'Purchase Complete - Mappic',
    meta: [{ name: 'description', content: 'Your credit purchase has been completed successfully.' }],
});

// Methods
async function validatePurchaseAndAddCredits() {
    if (!sessionId) {
        console.error('Debug - No session ID found in URL, redirecting to home');
        // Redirect to home if no session ID
        navigateTo('/');
        return;
    }

    try {
        // Step 1: Try to validate the Stripe session (if endpoint available)
        let validationResult;
        let purchaseData = null;

        if (runtimeConfig.public.functionsUrl) {
            const validationUrl = runtimeConfig.public.functionsUrl + '/payments/checkSession';

            try {
                validationResult = await apiService.request(validationUrl, {
                    method: 'POST',
                    body: {
                        sessionId: sessionId,
                    },
                });

                if (validationResult.success) {
                    purchaseData = validationResult.data;
                } else {
                    console.warn('Debug - Stripe validation failed:', validationResult);
                    // If session ID is invalid, clean URL and show error
                    const errorMsg = validationResult.message || validationResult.error || '';
                    if (
                        errorMsg.includes('No such checkout session') ||
                        errorMsg.includes('invalid') ||
                        errorMsg.includes('not found') ||
                        validationResult.code === 404
                    ) {
                        await cleanUrlAndShowError('Invalid or expired session ID');
                        return;
                    }
                    // For other validation errors, continue with sessionStorage fallback
                    console.warn('Will use sessionStorage fallback');
                }
            } catch (err) {
                console.warn('Debug - Stripe validation request failed, will use sessionStorage fallback:', err);
            }
        } else {
            console.warn('Debug - No functionsUrl configured, using sessionStorage only');
        }

        // Step 2: Get purchase details (either from Stripe validation or sessionStorage)

        // First try to get pack from sessionStorage (most reliable)
        let purchasedPack = null;
        const storedPack = sessionStorage.getItem('mappic_purchase_pack');
        if (storedPack) {
            try {
                const packData = JSON.parse(storedPack);
                purchasedPack = creditPurchasePacks.find(pack => pack.id === packData.id);
                console.log('Found pack from sessionStorage:', purchasedPack);
            } catch (e) {
                console.warn('Could not parse stored pack data');
            }
        }

        // If sessionStorage fails, try to identify from Stripe data
        if (!purchasedPack && purchaseData) {
            purchasedPack = creditPurchasePacks.find(
                pack =>
                    pack.stripeUrl.includes(purchaseData.productId) ||
                    pack.id === purchaseData.productId ||
                    pack.credits === purchaseData.credits
            );
            console.log('Found pack from Stripe data:', purchasedPack);
        }

        if (!purchasedPack) {
            console.error('Could not identify purchased credit pack. Debug info:', {
                purchaseData,
                storedPack,
                sessionId,
                availablePacks: creditPurchasePacks.map(p => ({ id: p.id, credits: p.credits })),
            });
            throw new Error('Could not identify purchased credit pack.');
        }

        // Step 3: Show warning if we're proceeding without Stripe validation
        if (!purchaseData) {
            console.warn('Proceeding without Stripe validation - using sessionStorage data only');
        }

        packPurchased.value = purchasedPack;
        creditsAdded.value = purchasedPack.credits;

        // Step 4: Add credits to user account
        let currentUser = authStore.user;

        // If no current user, try to get from sessionStorage
        if (!currentUser) {
            const storedUser = sessionStorage.getItem('mappic_purchase_user');
            if (storedUser) {
                try {
                    currentUser = JSON.parse(storedUser);
                } catch (e) {
                    console.warn('Could not parse stored user data');
                }
            }
        }

        if (currentUser?.uid) {
            // For authenticated users, add credits to their account
            const addCreditsResult = await userService.addCredits(currentUser.email, purchasedPack.credits, currentUser.uid);

            if (!addCreditsResult.success) {
                throw new Error('Failed to add credits to account');
            }

            // Force update credits in the composable for authenticated users
            const { updateCredits } = useCredits();
            await updateCredits(currentUser.uid);
        } else {
            // For guest users, add credits to localStorage
            const guestUid = userService.getGuestUid();
            const localStorageKey = `mappic_credits_${guestUid}`;
            const currentCredits = parseInt(localStorage.getItem(localStorageKey) || '3', 10);
            const newCredits = currentCredits + purchasedPack.credits;
            localStorage.setItem(localStorageKey, newCredits.toString());

            // Force update credits in the composable for guest users
            const { updateCredits } = useCredits();
            await updateCredits();
        }

        // Step 5: Clean up session storage
        sessionStorage.removeItem('mappic_purchase_pack');
        sessionStorage.removeItem('mappic_purchase_user');

        // Step 6: Mark as successful
        success.value = true;

        console.log('Credits successfully added:', {
            pack: purchasedPack,
            creditsAdded: creditsAdded.value,
            user: currentUser?.email || 'guest',
        });
    } catch (err) {
        console.error('Error processing purchase:', err);
        error.value = true;
        errorMessage.value = err.message || 'An error occurred while processing your purchase';
    } finally {
        loading.value = false;
    }
}

function goToMaps() {
    navigateTo('/maps/my-maps');
}

function goHome() {
    navigateTo('/');
}

async function cleanUrlAndShowError(message) {
    // Clean the URL by removing query parameters
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);

    // Show error state
    error.value = true;
    errorMessage.value = message;
    loading.value = false;
}

// Lifecycle
onMounted(async () => {
    await validatePurchaseAndAddCredits();
});
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-6">
        <div class="max-w-md w-full md:-translate-x-12">
            <!-- Loading State -->

            <div v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center">
                <div class="text-center">
                    <Loader color="#374151" />
                </div>
            </div>

            <!-- Success State -->
            <CardDefault v-else-if="success" class="text-center space-y-6">
                <!-- Success Icon -->
                <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <UIcon name="i-tabler-check" class="w-8 h-8 text-green-600" />
                </div>

                <!-- Success Message -->
                <div class="space-y-3">
                    <h2 class="text-2xl font-bold text-gray-900">{{ $t('Purchase Successful!') }}</h2>
                    <p class="text-gray-600">{{ $t('Your payment has been processed successfully.') }}</p>
                </div>

                <!-- Credits Added Info -->
                <div v-if="packPurchased" class="">
                    <div class="flex items-center justify-center space-x-2">
                        <span class="font-semibold">{{ creditsAdded }} {{ $t('credits added to your account') }}</span>
                    </div>
                    <!-- <p class="text-sm text-green-600 mt-2">{{ packPurchased.description }}</p> -->
                </div>

                <!-- Action Buttons -->
                <div class="grid grid-cols-2 w-full gap-4">
                    <UButton :label="$t('My maps')" size="xl" class="w-full justify-center" icon="i-tabler-map" @click="goToMaps" />

                    <UButton
                        :label="$t('Home')"
                        variant="outline"
                        size="xl"
                        class="w-full justify-center"
                        icon="i-tabler-smart-home"
                        @click="goHome" />
                </div>
            </CardDefault>

            <!-- Error State -->
            <CardDefault v-else-if="error" class="text-center space-y-6">
                <!-- Error Icon -->
                <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <UIcon name="i-tabler-x" class="w-8 h-8 text-red-600" />
                </div>

                <!-- Error Message -->
                <div class="space-y-3">
                    <h2 class="text-2xl font-bold text-gray-900">{{ $t('Payment Validation Failed') }}</h2>
                    <p class="text-gray-600">{{ errorMessage }}</p>
                    <p class="text-sm text-gray-500">
                        {{ $t('If you believe this is an error') }}
                        <a href="mailto:hi@basezero.dev" class="text-black font-medium">
                            {{ $t('please contact our support team') }}
                        </a>
                    </p>
                </div>

                <!-- Action Buttons -->
                <div class="grid gap-4 w-full">
                    <!-- <UButton
                        :label="$t('Try Again')"
                        size="xl"
                        block
                        icon="i-tabler-refresh"
                        @click="validatePurchaseAndAddCredits"></UButton> -->

                    <UButton
                        :label="$t('Return Home')"
                        variant="outline"
                        block
                        size="xl"
                        class="w-full justify-center"
                        icon="i-tabler-smart-home"
                        @click="goHome"></UButton>
                </div>
            </CardDefault>
        </div>
    </div>
</template>
