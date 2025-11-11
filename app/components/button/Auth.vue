<script setup>
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '~~/stores/authStore';
import ModalCredits from '~/components/ModalCredits.vue';

const props = defineProps({
    color: { type: String, default: 'gray' },
    label: { type: String, default: 'Me' },
});

const { t } = useI18n();
const authStore = useAuthStore();
const hover = ref(false);
const isLoggedIn = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const showCreditsModal = ref(false);

// Use the credits composable
const { credits, updateCredits } = useCredits();

// Watch for user changes and update credits
watch(
    user,
    async newUser => {
        const uid = newUser?.uid || undefined;
        await updateCredits(uid);
    },
    { immediate: true }
);

const userOptions = computed(() => [
    // Label name
    [
        {
            label: user.value?.name || label,
            onSelect: () => navigateTo('/account/my-profile'),
        },
    ],
    [
        {
            label: t('My Profile'),
            icon: 'i-tabler-user',
            onSelect: () => navigateTo('/account/my-profile'),
        },
        {
            label: t('Buy credits'),
            icon: 'i-tabler-credit-card',
            onSelect: () => openCreditsModal(),
        },
        {
            label: t('Send a report'),
            icon: 'i-tabler-send',
            onSelect: () => openReport(),
        },
    ],
    [
        {
            label: t('Logout'),
            icon: 'i-tabler-logout',
            onSelect: () => logout(),
        },
    ],
]);

const creditOptions = computed(() => [
    [
        {
            label: t('Buy credits'),
            icon: 'i-tabler-credit-card',
            onSelect: () => openCreditsModal(),
        },
    ],
]);

function openCreditsModal() {
    showCreditsModal.value = true;
}

function openReport() {
    // TODO: Implement report modal
    console.log('Open report modal');
}

async function logout() {
    await authStore.logout();
    navigateTo('/auth/logout');
}

function login() {
    navigateTo('/auth/login');
}

// Initialize credits on mount (auth check is done in auth.client.ts plugin)
onMounted(async () => {
    const uid = user.value?.uid || undefined;
    await updateCredits(uid);
});
</script>

<template>
    <ClientOnly>
        <!-- Authenticated user dropdown -->
        <EffectGlass v-if="isLoggedIn" class="rounded-full p-1" :displace="2" @mouseover="hover = true" @mouseleave="hover = false">
            <div class="flex gap-1 items-center">
                <UDropdownMenu
                    :items="userOptions"
                    size="lg"
                    :ui="{
                        content: 'max-w-48',
                    }">
                    <UButton rounded size="lg" class="flex items-center gap-2 max-w-22 md:max-w-36 truncate md:w-auto">
                        <span class="hidden md:block text-md font-semibold capitalize whitespace-nowrap truncate">
                            {{ user?.name || label }}
                        </span>
                        <UIcon class="md:hidden" name="i-tabler-user" size="18" />
                    </UButton>
                </UDropdownMenu>
                <UDropdownMenu
                    :items="creditOptions"
                    size="lg"
                    :ui="{
                        content: 'max-w-48',
                    }">
                    <UButton class="hidden md:block" rounded size="lg" variant="ghost" :label="`${credits || 0} ${$t('Credits')}`" />
                    <UButton class="md:hidden" rounded size="lg" variant="ghost" :label="`${credits || 0}`" />
                </UDropdownMenu>
            </div>
        </EffectGlass>

        <!-- Login button for non-authenticated users -->
        <template v-else>
            <EffectGlass class="flex items-center rounded-full p-1" :displace="2">
                <div class="flex gap-1 items-center">
                    <UButton rounded size="lg" @click="login">
                        <span class="hidden md:block text-md font-semibold capitalize whitespace-nowrap truncate">{{ t('Login') }}</span>
                        <UIcon class="md:hidden" name="i-tabler-key" size="18" />
                    </UButton>
                    <UButton
                        class="hidden md:block"
                        rounded
                        size="lg"
                        variant="ghost"
                        :label="`${credits || 0} ${$t('Credits')}`"
                        @click="openCreditsModal" />
                    <UButton class="md:hidden" rounded size="lg" variant="ghost" :label="`${credits || 0}`" @click="openCreditsModal" />
                </div>
            </EffectGlass>
        </template>

        <!-- Credits Modal -->
        <ModalCredits v-model="showCreditsModal" :show-requirement="false" />

        <template #fallback>
            <div class="flex glass glass-bg-white items-center rounded-full gap-1 p-1">
                <UButton icon="i-tabler-user" rounded size="lg" :label="t('Login')" disabled />
                <UButton class="hidden md:block" rounded size="lg" variant="ghost" :label="`0 ${$t('Credits')}`" disabled />
                <UButton class="md:hidden" rounded size="lg" variant="ghost" :label="`0 ${$t('Credits')}`" disabled />
            </div>
        </template>
    </ClientOnly>
</template>
