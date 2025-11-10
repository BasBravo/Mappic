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
    active: page.to === '/about/changelog',
}));
//
// SEO - Only English
//
useSeoMeta({
    title: 'Mappic Changelog - Complete Update History',
    ogTitle: 'Mappic Changelog - All Updates and Improvements',
    description:
        'Explore the complete update history of Mappic since launch. Discover new features, design improvements and optimizations we have implemented.',
    ogDescription: 'Complete Mappic update history. New features, improvements and optimizations since launch.',
    ogImage: '/og-image.png',
    ogUrl: `https://mappic.app/${locale?.value || 'en'}/about/changelog`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Mappic Changelog - Update History',
    twitterDescription: 'Discover all improvements and new features of Mappic since launch.',
    twitterImage: '/og-image.png',
    keywords: 'Mappic changelog, updates, version history, improvements, new features, development',
    author: 'Bas Bravo',
    robots: 'index, follow',
    canonical: `https://mappic.app/${locale?.value || 'en'}/about/changelog`,
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
        <div class="h-46" />

        <section>
            <div class="mx-auto max-w-3xl flex flex-col justify-center items-center">
                <h1 class="mt-4 text-7xl font-semibold tracking-tight text-balance text-gray-900">Changelog</h1>
            </div>
        </section>

        <section class="mx-auto max-w-2xl py-10 space-y-4">
            <h2 class="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white">2.0.1</h2>
            <dl>
                <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">18/08/2025</dt>
                <dd class="flex flex-col mb-4 font-light text-gray-700 sm:mb-5 dark:text-gray-400">
                    <p>Add Mandarin Chinese translation</p>
                    <p>New sections in the About the project area.</p>
                    <p>SEO improvements throughout the application.</p>
                </dd>
            </dl>

            <hr class="my-8 border-black/10" />

            <h2 class="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white">2.0.0</h2>
            <dl>
                <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">22/07/2025</dt>
                <dd class="flex flex-col mb-4 font-light text-gray-700 sm:mb-5 dark:text-gray-400">
                    <p>New design and map generation engine.</p>
                    <p>New domain mappic.app and redirects.</p>
                    <p>Redesign of components of the my maps section.</p>
                    <div class="h-3"></div>
                    <div class="flex gap-3">
                        <NuxtLink to="https://www.instagram.com/mappic.app/" target="_blank">
                            <ZButton label="Instagram" />
                        </NuxtLink>
                        <NuxtLink to="https://www.threads.net/@mappic.app" target="_blank">
                            <ZButton label="Threads" />
                        </NuxtLink>
                    </div>
                </dd>
            </dl>

            <hr class="my-8 border-black/10" />

            <h2 class="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white">1.3.0</h2>
            <dl>
                <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">13/10/2024</dt>
                <dd class="flex flex-col mb-4 font-light text-gray-700 sm:mb-5 dark:text-gray-400">
                    <p>Redesign of the map composition editing interface.</p>
                    <p>New CLEAN composition to generate maps without additional elements.</p>
                    <p>New map resolutions: XL and XXL. Only available in the CLEAN composition.</p>
                </dd>
            </dl>

            <hr class="my-8 border-black/10" />

            <h2 class="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white">1.2.0</h2>
            <dl>
                <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">24/09/2024</dt>
                <dd class="flex flex-col mb-4 font-light text-gray-700 sm:mb-5 dark:text-gray-400">
                    <p>New section of my maps.</p>
                    <p>Improved map sharing method.</p>
                </dd>
            </dl>

            <hr class="my-8 border-black/10" />

            <h2 class="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white">1.1.1</h2>
            <dl>
                <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">12/09/2024</dt>
                <dd class="flex flex-col mb-4 font-light text-gray-700 sm:mb-5 dark:text-gray-400">
                    <p>Fixed a bug that caused some geographic areas to be poorly positioned in the final design.</p>
                    <p>New map styles.</p>
                </dd>
            </dl>

            <hr class="my-8 border-black/10" />

            <h2 class="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white">1.1.0</h2>
            <dl>
                <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">08/08/2024</dt>
                <dd class="flex flex-col mb-4 font-light text-gray-700 sm:mb-5 dark:text-gray-400">
                    <p>New login and register pages.</p>
                    <p>Added the option to save generated maps.</p>
                    <p>Filtering of saved maps by size and style.</p>
                    <p>Added the option to share generated maps.</p>
                </dd>
            </dl>

            <hr class="my-8 border-black/10" />

            <h2 class="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white">1.0.2</h2>
            <dl>
                <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">03/07/2024</dt>
                <dd class="flex flex-col mb-4 font-light text-gray-700 sm:mb-5 dark:text-gray-400">
                    <p>Added the option to select the style, size and composition of the map.</p>
                    <p>Improved user interface.</p>
                    <p>Improved design of generated maps.</p>
                </dd>
            </dl>

            <hr class="my-8 border-black/10" />

            <h2 class="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white">1.0.1</h2>
            <dl>
                <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">24/06/2024</dt>
                <dd class="flex flex-col mb-4 font-light text-gray-700 sm:mb-5 dark:text-gray-400">
                    <p>Deployment of mappic on the Product Hunt platform.</p>
                    <div class="h-3"></div>
                    <NuxtLink to="https://www.producthunt.com/posts/mappic" target="_blank">
                        <ZButton label="See in Product Hunt" />
                    </NuxtLink>
                </dd>
            </dl>

            <hr class="my-8 border-black/10" />

            <h2 class="mb-4 text-xl font-extrabold leading-none text-gray-900 md:text-2xl dark:text-white">1.0.0</h2>
            <dl>
                <dt class="mb-2 font-semibold leading-none text-gray-900 dark:text-white">10/06/2024</dt>
                <dd class="flex flex-col mb-4 font-light text-gray-700 sm:mb-5 dark:text-gray-400">
                    <p>Initial launch of mappic.</p>
                    <p>Integration of the Nominatim and Mapbox API for map generation.</p>
                </dd>
            </dl>
        </section>
    </div>
</template>
