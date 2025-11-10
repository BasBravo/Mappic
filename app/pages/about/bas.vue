<script setup>
//
// IMPORTS
//
import { useI18n } from 'vue-i18n';
import { capitalize } from '~~/app/utils';
import { aboutPages } from '~~/data/nav';

//
// VARS
//
const { t, locale } = useI18n();

// Determine display language - fallback to English if not Spanish or English
const displayLocale = computed(() => {
    const currentLocale = locale?.value || 'en';
    return ['es', 'en'].includes(currentLocale) ? currentLocale : 'en';
});

//
// INIT
//
const myPages = aboutPages.map(page => ({
    ...page,
    to: `/${locale?.value || 'en'}${page.to}`,
    label: capitalize(t(page.label)),
    active: page.to === '/about/bas',
}));
//
// SEO
//
if (displayLocale.value == 'es') {
    useSeoMeta({
        title: 'Bas Bravo - Desarrollador de Mappic | Generador de Mapas',
        ogTitle: 'Conoce a Bas Bravo - El Desarrollador Detrás de Mappic',
        description:
            'Conoce a Bas Bravo, el desarrollador español detrás de Mappic. Descubre su pasión por crear herramientas digitales innovadoras y su misión de democratizar la cartografía personalizada.',
        ogDescription:
            'Bas Bravo, desarrollador de Mappic. Creando herramientas digitales innovadoras para democratizar la cartografía personalizada.',
        ogImage: '/images/avatar-bas.png',
        ogUrl: 'https://mappic.app/es/about/bas',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Bas Bravo - Desarrollador de Mappic',
        twitterDescription: 'Conoce al desarrollador español detrás de la plataforma de mapas personalizados más innovadora.',
        twitterImage: '/images/avatar-bas.png',
        keywords: 'Bas Bravo, desarrollador, Mappic, basezero, programador español, emprendedor, cartografía digital',
        author: 'Bas Bravo',
        robots: 'index, follow',
        canonical: 'https://mappic.app/es/about/bas',
    });
}
if (displayLocale.value == 'en') {
    useSeoMeta({
        title: 'Bas Bravo - Mappic Developer | Map Generator Creator',
        ogTitle: 'Meet Bas Bravo - The Developer Behind Mappic',
        description:
            'Meet Bas Bravo, the Spanish developer behind Mappic. Discover his passion for creating innovative digital tools and his mission to democratize custom cartography.',
        ogDescription: 'Bas Bravo, Mappic developer. Creating innovative digital tools to democratize custom cartography.',
        ogImage: '/images/avatar-bas.png',
        ogUrl: 'https://mappic.app/en/about/bas',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Bas Bravo - Mappic Developer',
        twitterDescription: 'Meet the Spanish developer behind the most innovative custom map platform.',
        twitterImage: '/images/avatar-bas.png',
        keywords: 'Bas Bravo, developer, Mappic, basezero, Spanish programmer, entrepreneur, digital cartography',
        author: 'Bas Bravo',
        robots: 'index, follow',
        canonical: 'https://mappic.app/en/about/bas',
    });
}
</script>

<template>
    <div class="w-full text-black">
        <ClientOnly>
            <teleport to="#HeaderMenu">
                <NavAbout />
            </teleport>
        </ClientOnly>

        <!-- Espacio inicial -->
        <div class="h-46" />

        <section>
            <div class="mx-auto max-w-3xl flex flex-col justify-center items-center">
                <div>
                    <img src="/images/avatar-bas.png" alt="Bas Bravo" class="w-20 rounded-full border-black border-2" />
                </div>
                <h1 class="mt-4 text-7xl font-semibold tracking-tight text-balance text-gray-900">
                    {{ displayLocale == 'en' ? 'About the dev' : '' }}
                    {{ displayLocale == 'es' ? 'Sobre el dev' : '' }}
                </h1>
            </div>
        </section>

        <section class="mx-auto max-w-2xl py-10 space-y-4">
            <p
                v-if="displayLocale == 'es'"
                v-html="
                    'Hola soy <a href=\'https://x.com/basbravo_\' target=\'_blank\'><b>Bas Bravo</b></a>, el desarrollador detrás de esta iniciativa de generación de mapas minimalistas. He creado esta herramienta con el objetivo de ofrecer una experiencia simple y efectiva para generar mapas de calidad basados en ubicaciones geográficas de todo el mundo. Mi pasión por la programación me ha llevado a explorar diversas ideas para ofrecer servicios y productos digitales. Esta es mi primera idea materializada en <a href=\'https://basezero.dev)\' target=\'_blank\'><b>basezero</b></a>, y estoy feliz de compartirla contigo.'
                "></p>
            <p
                v-if="displayLocale == 'en'"
                v-html="
                    'Hello! I am <a href=\'https://x.com/basbravo_\' target=\'_blank\'><b>Bas Bravo</b></a>, the developer behind this minimalist map generation initiative. I have created this tool with the aim of offering a simple and effective experience to generate quality maps based on geographical locations around the world. My passion for programming has led me to explore various ideas to offer digital services and products. This is my first idea materialized in <a href=\'https://basezero.dev)\' target=\'_blank\'><b>basezero</b></a>, and I am happy to share it with you.'
                "></p>
            <p
                v-if="displayLocale == 'es'"
                v-html="
                    'Mi objetivo es ofrecer una experiencia de cartografía simple pero efectiva utilizando la API de <a href=\'https://nominatim.org/release-docs/latest/\' target=\'_blank\'><b>Nominatim</b></a> basado en <a href=\'https://www.openstreetmap.org/#map=6/40.007/-2.488\'><b>OpenStreetMap</b></a> y <a href=\'https://www.mapbox.com\'><b>Mapbox</b></a>. <br>El desarrollo de este servicio se apoya en estas robusta APIs para generar mapas minimalistas que sean visualmente atractivos y listos para imprimir en sus versiones de resolucion más altas.'
                "></p>
            <p
                v-if="displayLocale == 'en'"
                v-html="
                    'My goal is to offer a simple but effective cartography experience using the <a href=\'https://nominatim.org/release-docs/latest/\' target=\'_blank\'><b>Nominatim</b></a> API based on <a href=\'https://www.openstreetmap.org/#map=6/40.007/-2.488\'><b>OpenStreetMap</b></a> and <a href=\'https://www.mapbox.com\'><b>Mapbox</b></a>. <br>The development of this service is supported by these robust APIs to generate minimalist maps that are visually appealing and ready to print in their highest resolution versions.'
                "></p>
            <p
                v-if="displayLocale == 'es'"
                v-html="
                    'Esta herramienta de generación de mapas minimalistas se ofrece bajo un precio pequeño para mantener y mejorar constantemente esta plataforma. También depende del apoyo de la comunidad en forma de donaciones. Cualquiera puede contribuir con donaciones para impulsar el desarrollo y garantizar la sostenibilidad a largo plazo de nuestra plataforma. Cada contribución, independientemente de su tamaño, es valorada y contribuye directamente a la mejora de la herramienta y al mantenimiento de nuestros servicios.'
                "></p>
            <p
                v-if="displayLocale == 'en'"
                v-html="
                    'This minimalist map generation tool is offered at a small price to constantly maintain and improve this platform. It also depends on community support in the form of donations. Anyone can contribute with donations to drive development and ensure the long-term sustainability of our platform. Each contribution, regardless of its size, is valued and contributes directly to the improvement of the tool and the maintenance of our services.'
                "></p>

            <p
                v-if="displayLocale == 'es'"
                v-html="
                    'Si te gusta esta herramienta y deseas apoyar su desarrollo continuo, ya sabes, <a href=\'https://donate.stripe.com/aEU8yhh060FC0HS003\' target=\'_blank\'><b>considerar hacer una donación</b></a>. Tu generosidad ayuda a mantener viva esta iniciativa y a hacer posible el desarrollo de herramientas de calidad para la comunidad de desarrolladores y entusiastas de la tecnología.'
                "></p>
            <p
                v-if="displayLocale == 'en'"
                v-html="
                    'If you like this tool and want to support its continuous development, you know, <a href=\'https://donate.stripe.com/aEU8yhh060FC0HS003\' target=\'_blank\'><b>consider making a donation</b></a>. Your generosity helps keep this initiative alive and makes it possible to develop quality tools for the developer community and technology enthusiasts.'
                "></p>
        </section>
    </div>
</template>
