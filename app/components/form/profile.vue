<script setup>
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { createUser } from '~~/shared/services/user';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Props
const props = defineProps({
    user: {
        type: Object,
        default: null,
    },
});

// Emits
const emit = defineEmits(['profile-updated']);
const { t } = useI18n();
const { initializeFirebase } = useFirebase();
const toast = useToast();

let userService = null;

const updating = ref(false);
const isEditing = ref(false);
const avatarFile = ref(null);

// Form data
const data = reactive({
    name: props.user?.name || '',
    email: props.user?.email || '',
    avatar: props.user?.avatar || '',
});

// Watch for user changes from parent
watch(
    () => props.user,
    user => {
        if (user) {
            data.name = user.name || '';
            data.email = user.email || '';
            data.avatar = user.avatar || '';
        }
    },
    { immediate: true }
);

// Validation schema
const schema = z.object({
    name: z.string().min(2, { message: t('name-min') }),
    email: z.string().email({ message: t('email-invalid') }),
    avatar: z
        .instanceof(File, {
            message: 'Please select an image file.',
        })
        .refine(file => file.size <= MAX_FILE_SIZE, {
            message: `The image is too large. Please choose an image smaller than ${formatBytes(MAX_FILE_SIZE)}.`,
        })
        .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
        })
        .optional(),
});

// Functions
async function handleUpdateProfile() {
    updating.value = true;

    try {
        // Ensure Firebase is initialized and user service is available
        if (!userService) {
            await initializeFirebase();
            userService = createUser();
        }

        // Use the save method from user service with the user's UID
        const result = await userService.save({
            uid: props.user?.uid,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
        });

        if (result.success) {
            // Emit the updated user data to parent
            emit('profile-updated', {
                uid: props.user?.uid || '',
                name: data.name,
                email: data.email,
                avatar: data.avatar,
            });

            // Show success toast
            toast.add({
                title: t('profile-updated'),
                icon: 'i-tabler-check',
                color: 'green',
            });

            isEditing.value = false;
        } else {
            // Show error toast
            toast.add({
                title: result.message || t('update-error'),
                icon: 'i-tabler-alert-circle',
                color: 'red',
            });
        }
    } catch (err) {
        // Show error toast
        toast.add({
            title: t('update-error'),
            icon: 'i-tabler-alert-circle',
            color: 'red',
        });
        console.error('Update profile error:', err);
    } finally {
        updating.value = false;
    }
}

function startEditing() {
    isEditing.value = true;
}

function cancelEditing() {
    isEditing.value = false;
    avatarFile.value = null;

    // Reset form data
    if (props.user) {
        data.name = props.user.name || '';
        data.email = props.user.email || '';
        data.avatar = props.user.avatar || '';
    }
}

function createObjectUrl(file) {
    return URL.createObjectURL(file);
}

function handleAvatarChange() {
    if (avatarFile.value) {
        // Convert file to base64 for saving
        const reader = new FileReader();
        reader.onload = e => {
            data.avatar = e.target.result;
        };
        reader.readAsDataURL(avatarFile.value);
    }
}
</script>

<template>
    <CardDefault v-if="props.user" class="overflow-hidden">
        <div class="flex w-full items-center justify-between">
            <div class="flex items-center gap-4">
                <!-- Avatar -->
                <img
                    :src="data.avatar"
                    :alt="data.name"
                    class="w-16 h-16 rounded-full object-cover bg-gray-100 border-2 border-black/10"
                    @error="event => (event.target.src = '')" />
                <div
                    v-if="!data.avatar"
                    class="absolute w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 border-2 border-black/10">
                    <UIcon name="i-tabler-user" class="w-8 h-8 text-gray-400" />
                </div>

                <div>
                    <h2 class="text-xl font-semibold text-gray-900">
                        {{ data.name || $t('Anonymous User') }}
                    </h2>
                    <p class="text-gray-600">{{ data.email }}</p>
                </div>
            </div>

            <!-- Edit/Cancel Buttons -->
            <div class="flex gap-2">
                <UButton
                    v-if="!isEditing"
                    icon="i-tabler-pencil"
                    variant="ghost"
                    size="lg"
                    :label="$t('Edit Profile')"
                    @click="startEditing" />
                <div v-if="isEditing" class="flex gap-3">
                    <UButton
                        type="submit"
                        icon="i-tabler-device-floppy"
                        size="lg"
                        :loading="updating"
                        :label="$t('Save Changes')"
                        @click="handleUpdateProfile" />
                    <UButton icon="i-tabler-x" variant="ghost" size="lg" :label="$t('Cancel')" @click="cancelEditing" />
                </div>
            </div>
        </div>

        <!-- Profile Form -->
        <div class="w-full space-y-6">
            <UForm :state="data" :schema="schema" @submit="handleUpdateProfile" class="grid grid-cols-2 gap-6">
                <!-- Name Field -->
                <UFormField :label="$t('Full Name')" name="name" required>
                    <UInput
                        v-model="data.name"
                        :placeholder="$t('Enter your full name')"
                        :disabled="!isEditing"
                        size="lg"
                        class="w-full"
                        icon="i-tabler-user" />
                </UFormField>

                <!-- Avatar Upload Field -->
                <UFormField :label="$t('Avatar Image (Optional)')" name="avatar">
                    <div v-if="isEditing">
                        <UFileUpload v-slot="{ open, removeFile }" v-model="avatarFile" accept="image/*" @change="handleAvatarChange">
                            <div class="py-0.5">
                                <!-- <UAvatar
                                    size="lg"
                                    :src="avatarFile ? createObjectUrl(avatarFile) : data.avatar || undefined"
                                    icon="i-tabler-user" /> -->

                                <UButton
                                    :label="avatarFile ? $t('Change image') : $t('Upload image')"
                                    variant="outline"
                                    icon="i-tabler-photo"
                                    @click="open()" />
                            </div>

                            <p v-if="avatarFile" class="text-xs text-gray-500 mt-1.5">
                                {{ avatarFile.name }}
                                <UButton
                                    :label="$t('Remove')"
                                    color="red"
                                    variant="link"
                                    size="xs"
                                    class="p-0 ml-2"
                                    @click="
                                        removeFile();
                                        avatarFile = null;
                                        data.avatar = props.user?.avatar || '';
                                    " />
                            </p>
                        </UFileUpload>
                    </div>
                    <div v-else class="flex items-center gap-3">
                        <!-- <UAvatar size="lg" :src="data.avatar || undefined" icon="i-tabler-user" /> -->
                        <span class="text-sm py-1.5 text-gray-600">
                            {{ data.avatar ? $t('Custom avatar uploaded') : $t('No avatar set') }}
                        </span>
                    </div>
                </UFormField>

                <!-- Email Field -->
                <UFormField :label="$t('Email Address')" name="email" :hint="$t('Not editable')" disabled>
                    <UInput
                        v-model="data.email"
                        type="email"
                        :placeholder="$t('Enter your email address')"
                        :disabled="true"
                        size="lg"
                        class="w-full"
                        icon="i-tabler-mail" />
                </UFormField>

                <!-- Member Since Field (always disabled) -->
                <UFormField :label="$t('Member Since')" name="memberSince" :hint="$t('Not editable')" disabled>
                    <UInput
                        :model-value="
                            new Date().toLocaleDateString($i18n.locale === 'en' ? 'en-US' : 'es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })
                        "
                        disabled
                        size="lg"
                        class="w-full"
                        icon="i-tabler-calendar" />
                </UFormField>
            </UForm>
        </div>
    </CardDefault>
</template>
