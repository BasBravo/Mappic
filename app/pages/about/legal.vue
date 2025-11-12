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
//
// INIT
//
const myPages = aboutPages.map(page => ({
    ...page,
    to: `/${locale?.value || 'en'}${page.to}`,
    label: capitalize(t(page.label)),
    active: page.to === '/about/legal',
}));
//
// SEO - Only English
//
useSeoMeta({
    title: 'Terms of Use - Mappic Legal Terms',
    ogTitle: 'Terms of Use and Legal Terms of Mappic',
    description: 'Read Mappic terms of use. Learn about legal terms, copyright, personal and commercial use of our custom maps.',
    ogDescription: 'Mappic terms of use. Legal terms, copyright and use of custom maps.',
    ogImage: '/og-image.png',
    ogUrl: `https://mappic.app/${locale?.value || 'en'}/about/legal`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Terms of Use - Mappic',
    twitterDescription: 'Legal terms and conditions of use for Mappic custom maps.',
    twitterImage: '/og-image.png',
    keywords: 'terms of use, legal terms, Mappic, copyright, commercial use, usage policy',
    author: 'Bas Bravo',
    robots: 'index, follow',
    canonical: `https://mappic.app/${locale?.value || 'en'}/about/legal`,
});
</script>

<template>
    <div class="w-full text-black">
        <ClientOnly>
            <teleport to="#HeaderMenu">
                <NavAbout />
            </teleport>
        </ClientOnly>

        <!-- Espacio inicial -->
        <div class="h-22 md:h-46" />

        <section>
            <div class="mx-auto max-w-3xl flex flex-col justify-center md:items-center">
                <h1 class="mt-4 text-5xl md:text-7xl font-medium tracking-tight text-balance text-gray-900">Terms of Use</h1>
            </div>
        </section>

        <section class="mx-auto max-w-2xl py-10 space-y-4">
            <p>The use of this tool implies acceptance of the terms of use detailed below:</p>
            <p>
                <b>1. Personal Use</b>
                This tool is designed for personal use and not for commercial use. The use of this tool for commercial or resale purposes is
                not allowed.
            </p>
            <p>
                <b>2. Printing Maps</b>
                The maps generated with this tool are intended to be printed and used in personal projects. Printing maps generated with
                this tool for resale or commercial use is not allowed.
            </p>
            <p>
                <b>3. Copyright</b>
                The maps generated with this tool are protected by copyright. Reproduction, distribution or modification of maps generated
                with this tool is not allowed without the author's permission.
            </p>
            <p>
                <b>4. Accuracy of the Generation</b>
                The accuracy of the maps generated with this tool is subject to some limitations in terms of precision. 100% accuracy in the
                print area cannot be guaranteed. Results may vary depending on the selected location and print resolution.
            </p>
            <p>
                <b>5. Use of Personal Data</b>
                The information provided by the user is used solely for the generation of maps and is not shared with third parties. We
                reserve the right to use the information provided to improve our services, notify of new features or important
                announcements, and offer a personalized user experience.
            </p>
        </section>
    </div>
</template>
