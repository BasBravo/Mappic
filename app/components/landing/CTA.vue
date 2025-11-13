<script setup>
//
// IMPORTS
//
import { useI18n } from 'vue-i18n';
import { capitalize } from '~~/app/utils';
import { aboutPages } from '~~/data/nav';
import { mapGenerationCosts, creditPurchasePacks } from '~~/data/credits';
//
// VARS
//
const { t, locale } = useI18n();
//
// INIT
//
const myPages = aboutPages.map(page => ({
    ...page,
    to: `/${locale?.value || 'en'}${page.to}`,
    label: capitalize(t(page.label)),
    active: page.to === '/about',
}));

// Helper function to get text with fallback to English
const getLocalizedText = (enText, esText = '', zhText = '') => {
    // Safety check for locale
    const currentLocale = locale?.value || 'en';

    if (currentLocale === 'zh' && zhText) return zhText;
    if (currentLocale === 'es' && esText) return esText;
    if (currentLocale === 'en' && enText) return enText;
    // Fallback to English if no translation available
    return enText || '';
};

const goTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
    <section class="bg-primary rounded-4xl mb-10">
        <div class="items-center mx-auto max-w-screen-xl gap-8 xl:gap-16 grid grid-cols-1 md:grid-cols-3 py-16 px-8">
            <div class="flex justify-center order-2 md:order-1">
                <div class="max-w-64 md:max-w-96">
                    <MapStatic uid="23704b45d0e94756903eafe109e535fc" class="w-full xl:w-96" :interactive="false" />
                </div>
            </div>
            <div class="md:col-span-2 text-center md:text-left order-1 md:order-2 text-white">
                <h2 class="mb-4 text-3xl md:text-5xl tracking-tight font-extrabold text-balance">
                    {{
                        getLocalizedText(
                            'Create your next map with Mappic',
                            'Crea tu próximo mapa con Mappic',
                            '使用Mappic创建您的下一张地图'
                        )
                    }}
                </h2>
                <p class="mb-6 font-light text-base md:text-xl text-balance">
                    {{
                        locale == 'en'
                            ? 'Create custom maps of any city in the world in a few minutes. Choose the style, size, and design that best suits your needs and preferences.'
                            : ''
                    }}
                    {{
                        locale == 'es'
                            ? 'Crea mapas personalizados de cualquier ciudad del mundo en pocos minutos. Elige el estilo, tamaño y diseño que mejor se adapte a tus necesidades y preferencias.'
                            : ''
                    }}
                </p>

                <div class="flex justify-center md:justify-start">
                    <NuxtLink class="flex w-full max-w-44" :to="`/${locale}`">
                        <UButton
                            @click="goTop"
                            color="neutral"
                            size="2xl"
                            block
                            :label="capitalize(t(locale == 'en' ? 'create map' : 'crea mapa'))" />
                    </NuxtLink>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped></style>
