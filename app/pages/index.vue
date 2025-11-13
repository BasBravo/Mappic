<script setup>
// IMPORTS //////////////////////

import { useMapStore } from '~~/stores/mapStore';
import { useRoute } from 'vue-router';

// COMPOSABLES //////////////////////

const { sanitizeI18nContent } = useSanitizer();
const { t } = useI18n();
const route = useRoute();

// STORES //////////////////////

const mapStore = useMapStore();

// DATA //////////////////////

const config = useRuntimeConfig();
const hostUrl = config.public.hostUrl || 'https://mappic.app';

// FUNCTIONS //////////////////////

const handleLocationSelected = location => {
    mapStore.setSelectedLocation(location);
    navigateTo('/maps/editor');
};

// SEO & HEAD //////////////////////

const seoTitle = t('home.seo.title');
const seoDescription = t('home.seo.description');
const seoKeywords = t('home.seo.keywords');
const canonicalUrl = `${hostUrl}${route.path}`;
const ogImage = `${hostUrl}/ogImage.png`;

useHead({
    title: seoTitle,
    meta: [
        // Standard Meta Tags
        {
            name: 'description',
            content: seoDescription,
        },
        {
            name: 'keywords',
            content: seoKeywords,
        },
        {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0',
        },
        {
            name: 'theme-color',
            content: '#1E3A5F',
        },

        // Open Graph Tags (Social Media)
        {
            property: 'og:type',
            content: 'website',
        },
        {
            property: 'og:title',
            content: seoTitle,
        },
        {
            property: 'og:description',
            content: seoDescription,
        },
        {
            property: 'og:image',
            content: ogImage,
        },
        {
            property: 'og:url',
            content: canonicalUrl,
        },
        {
            property: 'og:site_name',
            content: 'Mappic.app',
        },

        // Twitter Card Tags
        {
            name: 'twitter:card',
            content: 'summary_large_image',
        },
        {
            name: 'twitter:title',
            content: seoTitle,
        },
        {
            name: 'twitter:description',
            content: seoDescription,
        },
        {
            name: 'twitter:image',
            content: ogImage,
        },
        {
            name: 'twitter:site',
            content: '@mappic_app',
        },

        // Additional SEO
        {
            name: 'author',
            content: 'Mappic.app',
        },
        {
            name: 'robots',
            content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        },
        {
            httpEquiv: 'x-ua-compatible',
            content: 'IE=edge',
        },
    ],
    link: [
        {
            rel: 'canonical',
            href: canonicalUrl,
        },
    ],
    script: [
        {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'Mappic',
                description: seoDescription,
                url: hostUrl,
                applicationCategory: 'DesignApplication',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                },
                operatingSystem: 'Web',
                inLanguage: ['en', 'es', 'zh'],
                author: {
                    '@type': 'Organization',
                    name: 'Mappic.app',
                    url: hostUrl,
                },
                image: ogImage,
            }),
        },
    ],
});
</script>

<template>
    <div class="w-full">
        <!-- Espacio inicial -->
        <div class="h-46" />

        <div class="xl:px-20 text-black">
            <h1 class="text-5xl md:text-7xl 2xl:text-8xl md:max-w-2xl 2xl:max-w-5xl font-medium tracking-tight text-balance">
                {{ $t('home.title') }}
            </h1>
            <p class="hidden md:flex mt-8 text-2xl text-balance" v-html="sanitizeI18nContent($t('home.slogan'))"></p>
            <p class="flex md:hidden mt-8 text-lg text-balance" v-html="sanitizeI18nContent($t('home.slogan_mobile'))"></p>
            <div class="mt-10 w-full flex flex-col gap-4">
                <!-- Buscador de ubicaciones -->
                <div class="hidden md:flex justify-start max-w-3xl">
                    <InputSearchLocation :placeholder="$t('Search for locations...')" @location-selected="handleLocationSelected" />
                </div>
                <!-- Botón para continuar editando mapa existente -->
                <div v-if="mapStore.selectedLocation" class="flex justify-start">
                    <UButton color="neutral" :to="'/maps/editor'" size="lg" icon="i-tabler-pencil">
                        {{ $t('Continue editing') }}: {{ mapStore.mapTitle }}
                    </UButton>
                </div>
            </div>
        </div>
        <!-- GRID DE MAPAS  -->
        <div class="w-full py-0 md:py-10">
            <div class="min-h-[calc(100vh-20rem)]">
                <MapsGrid />
            </div>
            <div class="flex justify-center py:0 md:py-10 pt-20">
                <!-- go to explore -->
                <div class="min-w-64">
                    <UButton color="neutral" variant="outline" :to="'/maps/explore'" size="3xl" block>
                        {{ $t('Explore more maps') }}
                    </UButton>
                </div>
            </div>
        </div>

        <!-- LANDING SECTIONS -->
        <LandingFeatures />
        <LandingHowItWorks />
        <!-- <LandingSocialProof /> -->
        <LandingFAQ />
        <LandingCTA />

        <ElementsFooterLinks />
    </div>
</template>

<style scoped></style>
