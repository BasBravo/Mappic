<script setup>
import { useAuthStore } from '~~/stores/authStore';
import { creditPurchasePacks } from '~~/data/credits';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    requiredCredits: {
        type: Number,
        default: null,
    },
    showRequirement: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['update:modelValue']);

const authStore = useAuthStore();
const { credits: userCredits } = useCredits();
const { locale } = useI18n();

// Computed property to control modal visibility
const isOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
});

function purchaseCredits(pack) {
    // Store the pack info in session storage for later reference
    sessionStorage.setItem(
        'mappic_purchase_pack',
        JSON.stringify({
            id: pack.id,
            credits: pack.credits,
            description: pack.description,
            price: pack.price,
        })
    );

    // Add current user info to help with credit attribution
    const currentUser = authStore.user;
    if (currentUser) {
        sessionStorage.setItem(
            'mappic_purchase_user',
            JSON.stringify({
                uid: currentUser.uid,
                email: currentUser.email,
            })
        );
    }

    // Build return URL with current locale
    const returnUrl = `${window.location.origin}/${locale.value}/stripe/purchased`;

    // Build Stripe URL with return URL parameters
    const separator = pack.stripeUrl.includes('?') ? '&' : '?';
    const stripeUrlWithReturn = `${pack.stripeUrl}${separator}success_url=${encodeURIComponent(
        returnUrl + '?session={CHECKOUT_SESSION_ID}'
    )}&cancel_url=${encodeURIComponent(returnUrl)}`;

    console.log('Debug - Redirecting to Stripe URL:', stripeUrlWithReturn);

    // Open Stripe URL in same tab for better UX
    window.location.href = stripeUrlWithReturn;
}
</script>

<template>
    <ElementsModal v-model:open="isOpen" :title="$t('Get more credits')">
        <!-- Login required message -->
        <div v-if="!authStore.isAuthenticated" class="w-full h-full flex items-center justify-center p-6">
            <CardComposition
                image-src="/opendoodles/clumsy.svg"
                class="border-none"
                :title="$t('Login Required')"
                :description="$t('Please log in to purchase credits')">
                <UButton size="xl" block :to="'/auth/login'">
                    {{ $t('Login') }}
                </UButton>
            </CardComposition>
        </div>

        <!-- Credit purchase content for authenticated users -->
        <template v-else>
            <!-- Current status -->
            <!-- <div class="mb-6 text-center">
                <p>
                    {{ $t('You have') }}
                    <strong>{{ userCredits }}</strong>
                    {{ $t('credits') }}
                </p>
                <p v-if="showRequirement && requiredCredits" class="text-red-600 mt-1">
                    {{ $t('You need at least {count} credits to generate this map', { count: requiredCredits }) }}
                </p>
            </div> -->

            <!-- Credit packs -->
            <div class="space-y-3">
                <div
                    v-for="pack in creditPurchasePacks"
                    :key="pack.id"
                    class="flex items-center justify-between p-5 border rounded-3xl cursor-pointer transition-all"
                    :class="[pack.popular ? 'bg-black text-white' : 'bg-gray-100']"
                    @click="purchaseCredits(pack)">
                    <div class="flex items-center gap-5">
                        <div class="text-center">
                            <p class="text-2xl font-bold">{{ pack.credits }}</p>
                            <p class="text-xs" :class="pack.popular ? 'text-gray-400' : 'text-gray-500'">
                                {{ $t('Credits') }}
                            </p>
                        </div>
                        <div>
                            <p class="font-medium">{{ $t(pack.description) }}</p>
                            <p v-if="pack.popular" class="text-xs text-red-400 font-medium">
                                {{ $t('Popular') }}
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p v-if="pack.price" class="text-lg font-bold">{{ pack.price }}</p>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="mt-6 pt-4 text-center">
                <p class="text-xs text-gray-500">{{ $t('Secure payment via Stripe') }}</p>
            </div>
        </template>
    </ElementsModal>
</template>
