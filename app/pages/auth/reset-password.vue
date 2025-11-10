<script setup>
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { createAuth } from '~~/shared/services/auth';

const { t } = useI18n();
const authService = createAuth();

const loading = ref(false);
const error = ref('');
const success = ref(false);
const router = useRouter();

const data = reactive({
    email: '',
});

const schema = z.object({
    email: z.string().email({ message: t('email invalid') }),
});

async function handleResetPassword() {
    loading.value = true;
    error.value = '';

    try {
        const result = await authService.resetPassword(data.email);
        console.log('Reset password result:::', result);

        if (result.success) {
            success.value = true;
        } else {
            error.value = t(result.message) || t('reset password error');
        }
    } catch (err) {
        error.value = t('reset password error');
        console.error('Reset password error:', err);
    } finally {
        loading.value = false;
    }
}

function back() {
    router.back();
}
</script>

<template>
    <div class="min-h-[calc(100dvh-4rem)] flex justify-center">
        <div class="flex flex-col gap-6 max-w-sm w-full my-auto py-8">
            <!-- ERROR -->
            <div
                v-if="error"
                class="flex bg-red-50 justify-between rounded-4xl border-2 border-red-300 p-6 px-10 gap-6 items-center w-full">
                <span class="text-red-500 text-md w-full text-center">
                    {{
                        typeof error === 'string' &&
                        (error.startsWith('login-') || error.startsWith('email-') || error.startsWith('password-'))
                            ? $t(error)
                            : error
                    }}
                </span>
            </div>

            <!-- Success -->
            <div
                v-if="success"
                class="flex bg-green-50 justify-between rounded-4xl border-2 border-green-300 p-6 px-10 gap-6 items-center w-full">
                <span class="text-green-500 text-md w-full text-center">
                    {{ t('email sent') }}
                </span>
            </div>

            <div class="flex flex-col bg-white rounded-4xl border-2 border-black/10 p-10 gap-6 items-center w-full">
                <h2 class="w-full text-xl font-semibold">
                    {{ t('Reset password') }}
                </h2>
                <p class="w-full text-sm text-gray-600">
                    {{ t('Enter your email to receive reset instructions') }}
                </p>
                <UForm :state="data" :schema="schema" @submit="handleResetPassword" class="space-y-4 w-full">
                    <UFormField :label="t('Email')" name="email" size="xl" required>
                        <UInput v-model="data.email" class="w-full" type="email" :placeholder="t('Insert your email')" size="xl" required />
                    </UFormField>

                    <UButton type="submit" :loading="loading" :label="t('Send reset email')" size="xl" block class="mt-3" />
                </UForm>

                <!-- Actions -->
                <div class="w-full flex justify-between items-center mt-4 text-sm">
                    <UButton :label="t('Return')" icon="i-tabler-arrow-left" variant="ghost" @click="back" />
                </div>
            </div>
        </div>
    </div>
</template>
