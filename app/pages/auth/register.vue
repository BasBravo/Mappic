<script setup>
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '~~/stores/authStore';
import { createAuth } from '~~/shared/services/auth';
import { createUser } from '~~/shared/services/user';

const { t } = useI18n();
const authStore = useAuthStore();
const authService = createAuth();
const userService = createUser();
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const error = ref('');
const service = route.query.service || null;
const redirect = route.query.redirect || null;

const data = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
});

const schema = z
    .object({
        name: z.string().min(2, { message: t('name min 2') }),
        email: z.string().email({ message: t('email invalid') }),
        password: z.string().min(6, { message: t('password min 6') }),
        confirmPassword: z.string(),
        terms: z.boolean().refine(val => val === true, { message: t('accept conditions') }),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: t('passwords do not match'),
        path: ['confirmPassword'],
    });

async function handleRegister() {
    loading.value = true;
    error.value = '';

    try {
        console.log('Starting registration process for:', data.email);
        const result = await authService.register(data.email, data.password, data.name);
        console.log('Auth service register result:', result);

        if (result.success) {
            const token = result.idToken;

            // Get the created user from database (should exist since register creates it)
            console.log('Looking for user in database:', result.uid);
            let user = await userService.getUser(result.uid);
            console.log('User lookup result:', user);

            if (!user.success) {
                console.log('User not found in database, creating manually...');
                // Fallback: create user in database if not exists
                const userData = await authService.createUser(result.email, data.name, result.uid);
                console.log('Manual user creation result:', userData);
                if (userData.success) {
                    user = { success: true, data: userData.data };
                }
            }

            authStore.saveUser({
                auth: {
                    token,
                    uid: result.uid,
                    email: result.email,
                },
                data: {
                    uid: result.uid,
                    email: result.email,
                    name: data.name,
                    avatar: user.data?.avatar,
                },
            });

            // Redirect
            if (redirect) {
                const url = new URL(redirect);
                url.searchParams.set('token', token);
                await navigateTo(url.toString(), { external: true });
            } else {
                await navigateTo('/');
            }
        } else {
            error.value = t(result.message) || t('register error');
        }
    } catch (err) {
        error.value = t('register error');
        console.error('Register error:', err);
    } finally {
        loading.value = false;
    }
}

function back() {
    router.back();
}

const loginUrl = computed(() => {
    let url = '/auth/login';
    const params = new URLSearchParams();

    if (service) params.set('service', service);
    if (redirect) params.set('redirect', redirect);

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    return url;
});

// Check if already authenticated (auth check is done in auth.client.ts plugin)
watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated) => {
        if (isAuthenticated) {
            if (redirect) {
                await navigateTo(redirect, { external: true });
            } else {
                await navigateTo('/');
            }
        }
    }
);
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

            <!-- Register Form -->
            <div class="flex flex-col bg-white rounded-4xl border-2 border-black/10 p-10 gap-6 items-center w-full">
                <UForm :state="data" :schema="schema" @submit="handleRegister" class="space-y-4 w-full">
                    <UFormField :label="t('Name')" name="name" size="xl" required>
                        <UInput v-model="data.name" class="w-full" type="text" :placeholder="t('Insert your name')" size="lg" required />
                    </UFormField>

                    <UFormField :label="t('Email')" name="email" size="xl" required>
                        <UInput v-model="data.email" class="w-full" type="email" :placeholder="t('Insert your email')" size="lg" required />
                    </UFormField>

                    <UFormField :label="t('Password')" name="password" size="xl" required>
                        <UInput
                            v-model="data.password"
                            class="w-full"
                            type="password"
                            :placeholder="t('Insert your password')"
                            size="lg"
                            required />
                    </UFormField>

                    <UFormField :label="t('Confirm password')" name="confirmPassword" size="xl" required>
                        <UInput
                            v-model="data.confirmPassword"
                            class="w-full"
                            type="password"
                            :placeholder="t('Confirm your password')"
                            size="lg"
                            required />
                    </UFormField>

                    <UFormField name="terms" class="pt-2">
                        <UCheckbox v-model="data.terms" :label="t('I accept the terms of service')" size="xl" required />
                    </UFormField>

                    <UButton type="submit" :loading="loading" :label="t('Create account')" size="xl" block class="mt-3" />
                </UForm>

                <!-- Actions -->
                <div class="w-full flex justify-between items-center mt-4 text-sm">
                    <UButton :label="t('Return')" icon="i-tabler-arrow-left" variant="ghost" @click="back" />
                </div>
            </div>

            <!-- Login Link -->
            <div class="flex bg-white justify-between rounded-4xl border-2 border-black/10 p-10 gap-6 items-center w-full">
                <span class="text-sm text-gray-500">
                    {{ t('If you have an account') }}
                </span>
                <UButton :to="loginUrl" :label="t('Login')" variant="outline" size="xl" />
            </div>
        </div>
    </div>
</template>
