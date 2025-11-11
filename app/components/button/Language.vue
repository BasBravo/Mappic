<script setup>
import { useI18n } from 'vue-i18n';

const props = defineProps({
    color: { type: String, default: 'black' },
});

const { locale, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const router = useRouter();

const languages = {
    es: { label: 'Español', short: 'ES' },
    en: { label: 'English', short: 'EN' },
    zh: { label: '中文', short: '中文' },
};

const options = computed(() => [
    [
        {
            label: languages.es.label,
            onSelect: () => changeLanguage('es'),
            disabled: locale.value === 'es',
        },
        {
            label: languages.en.label,
            onSelect: () => changeLanguage('en'),
            disabled: locale.value === 'en',
        },
        {
            label: languages.zh.label,
            onSelect: () => changeLanguage('zh'),
            disabled: locale.value === 'zh',
        },
    ],
]);

const currentLanguage = computed(() => languages[locale.value] || languages.en);

async function changeLanguage(code) {
    try {
        // Store preference in localStorage first
        if (typeof window !== 'undefined') {
            localStorage.setItem('locale', code);
        }

        // Use setLocale for proper reactivity
        await setLocale(code);

        // Force a refresh to ensure all components update
        await nextTick();

        // Navigate to the new locale path
        await navigateTo(switchLocalePath(code));
    } catch (error) {
        console.error('Error changing language:', error);
    }
}
</script>

<template>
    <div>
        <UDropdownMenu
            :items="options"
            size="lg"
            :content="{
                align: 'center',
            }"
            :ui="{
                content: 'w-32',
            }">
            <UButton color="neutral" icon="i-tabler-language" rounded size="lg" variant="ghost" />
        </UDropdownMenu>
    </div>
</template>

<style lang=""></style>
