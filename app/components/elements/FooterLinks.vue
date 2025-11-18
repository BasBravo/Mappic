<script setup>
// IMPORTS //////////////////////

import { computed } from 'vue';

// DATA //////////////////////

// COMPUTED //////////////////////

const linkItems = computed(() => [
    {
        key: 'about',
        label: 'About Mappic',
        href: '/about',
        external: false,
    },
    {
        key: 'terms',
        label: 'Terms & Conditions',
        href: '/info/terms-and-conditions',
        external: false,
    },
    {
        key: 'privacy',
        label: 'Privacy Policy',
        href: '/info/privacy-policy',
        external: false,
    },
    {
        key: 'cookies',
        label: 'Cookie Policy',
        href: '/info/cookie-policy',
        external: false,
    },
    {
        key: 'legal',
        label: 'Legal Notice',
        href: '/info/legal-notice',
        external: false,
    },
    {
        key: 'contact',
        label: 'Contact',
        href: 'mailto:hi@basezero.dev',
        external: true,
    },
]);

const socialLinks = computed(() => [
    {
        key: 'instagram',
        label: 'Instagram',
        href: 'https://www.instagram.com/mappic.app/',
        icon: 'i-tabler-brand-instagram',
        external: true,
    },
    {
        key: 'pinterest',
        label: 'Pinterest',
        href: 'https://pinterest.com/mappic_app/',
        icon: 'i-tabler-brand-pinterest',
        external: true,
    },
    {
        key: 'threads',
        label: 'Threads',
        href: 'https://www.threads.com/@mappic.app',
        icon: 'i-tabler-brand-threads',
        external: true,
    },
]);
</script>

<template>
    <section class="border bg-white border-black/10 rounded-4xl mb-10 py-10">
        <div class="container mx-auto px-8 md:px-12">
            <nav aria-labelledby="footer-links-title" class="flex flex-col gap-8">
                <!-- Main Links -->
                <ul class="grid gap-x-6 gap-y-3 text-sm text-muted grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <li v-for="link in linkItems" :key="link.key">
                        <UButton :to="link.href" color="neutral" variant="ghost" class="opacity-70 hover:opacity-100">
                            {{ link.label }}
                        </UButton>
                    </li>
                </ul>

                <!-- Social Links -->
                <div class="flex gap-4">
                    <a
                        v-for="social in socialLinks"
                        :key="social.key"
                        :href="social.href"
                        :title="social.label"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-black/5 hover:bg-black/10 transition-colors">
                        <UIcon :name="social.icon" class="text-xl" />
                    </a>
                </div>
            </nav>
        </div>
    </section>
</template>

<style scoped></style>
