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
const router = useRouter();

const loading = ref(false);
const loadingGoogle = ref(false);
const loadingGithub = ref(false);
const error = ref('');

const data = reactive({
    email: '',
    password: '',
});

const schema = z.object({
    email: z.string().email({ message: t('email-invalid') }),
    password: z.string().min(6, { message: t('password-min') }),
});

async function handleLogin() {
    loading.value = true;
    error.value = '';

    try {
        const result = await authService.login(data.email, data.password);

        if (result.success) {
            const token = result.idToken;
            const user = await userService.getUser(result.uid);

            if (user.success) {
                authStore.saveUser({
                    auth: {
                        token,
                        uid: user.data.uid,
                        email: user.data.email,
                    },
                    data: {
                        uid: user.data.uid,
                        email: user.data.email,
                        name: user.data.name || 'User',
                        avatar: user.data.photoURL,
                    },
                });
            }

            await navigateTo('/');
        } else {
            error.value = t(result.message) || t('login-error');
        }
    } catch (err) {
        error.value = t('login-error');
        console.error('login-error:', err);
    } finally {
        loading.value = false;
    }
}

async function handleGoogleLogin() {
    loadingGoogle.value = true;
    error.value = '';

    try {
        const result = await authService.loginWithGoogle();

        if (result.success) {
            const token = result.idToken;

            // Get or create user in database
            let user = await userService.getUser(result.uid);

            if (!user.success) {
                // User doesn't exist in database, create it
                const userData = await authService.createUser(result.email, result.name || 'User', result.uid);
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
                    name: result.name || user.data?.name || 'User',
                    avatar: result.photoURL || user.data?.avatar,
                },
            });

            await navigateTo('/');
        } else {
            error.value = t(result.message) || t('login-error');
        }
    } catch (err) {
        error.value = t('login-error');
        console.error('Google login error:', err);
    } finally {
        loadingGoogle.value = false;
    }
}

async function handleGithubLogin() {
    loadingGithub.value = true;
    error.value = '';

    try {
        const result = await authService.loginWithGitHub();

        if (result.success) {
            const token = result.idToken;

            // Get or create user in database
            let user = await userService.getUser(result.uid);

            if (!user.success) {
                // User doesn't exist in database, create it
                const userData = await authService.createUser(result.email, result.name || 'User', result.uid);
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
                    name: result.name || user.data?.name || 'User',
                    avatar: result.photoURL || user.data?.avatar,
                },
            });

            await navigateTo('/');
        } else {
            error.value = result.message || 'login-error';
        }
    } catch (err) {
        error.value = 'login-error';
        console.error('Github login error:', err);
    } finally {
        loadingGithub.value = false;
    }
}

function back() {
    router.back();
}

const registerUrl = computed(() => {
    let url = '/auth/register';

    return url;
});

// Check if already authenticated (auth check is done in auth.client.ts plugin)
watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated) => {
        if (isAuthenticated) {
            await navigateTo('/');
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

            <div class="flex flex-col bg-white rounded-4xl border-2 border-black/10 p-10 gap-6 items-center w-full">
                <!-- Login Form -->

                <UForm :state="data" :schema="schema" @submit="handleLogin" class="space-y-4 w-full">
                    <UFormField :label="t('Email')" name="email" size="xl" required>
                        <UInput v-model="data.email" class="w-full" type="email" :placeholder="t('Insert your email')" size="xl" required />
                    </UFormField>

                    <UFormField :label="t('Password')" name="password" size="xl" required>
                        <UInput
                            v-model="data.password"
                            class="w-full"
                            type="password"
                            :placeholder="t('Insert your password')"
                            size="xl"
                            required />
                    </UFormField>

                    <UButton type="submit" :loading="loading" :label="t('Login')" size="xl" block class="mt-3" />
                </UForm>

                <!-- Social Login -->
                <div class="w-full grid grid-cols-2 gap-3 mt-4">
                    <UButton
                        icon="i-tabler-brand-google"
                        :label="t('Google')"
                        variant="outline"
                        size="lg"
                        class="justify-center"
                        :loading="loadingGoogle"
                        @click="handleGoogleLogin" />
                    <UButton
                        icon="i-tabler-brand-github"
                        :label="t('GitHub')"
                        variant="outline"
                        size="lg"
                        class="justify-center"
                        :loading="loadingGithub"
                        @click="handleGithubLogin" />
                </div>

                <!-- Actions -->
                <div class="w-full flex justify-between items-center mt-4 text-sm">
                    <UButton :label="t('Return')" icon="i-tabler-arrow-left" variant="ghost" @click="back" />
                    <UButton :label="t('Forgot password')" variant="ghost" to="/auth/reset-password" />
                </div>
            </div>

            <div class="flex bg-white justify-between rounded-4xl border-2 border-black/10 p-10 gap-6 items-center w-full">
                <span class="text-sm text-gray-500">
                    {{ t("Don't have an account?") }}
                </span>
                <UButton :label="t('Register')" size="xl" variant="outline" :to="registerUrl" />
            </div>
        </div>
    </div>
</template>
