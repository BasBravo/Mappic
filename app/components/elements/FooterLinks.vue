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
</script>

<template>
    <section class="border bg-white border-black/10 rounded-4xl mb-10 py-10">
        <div class="container mx-auto px-8 md:px-12">
            <nav aria-labelledby="footer-links-title" class="flex flex-col gap-4">
                <ul class="grid gap-x-6 gap-y-3 text-sm text-muted grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <li v-for="link in linkItems" :key="link.key">
                        <UButton :to="link.href" color="neutral" variant="ghost" class="opacity-70 hover:opacity-100">
                            {{ link.label }}
                        </UButton>
                    </li>
                </ul>
            </nav>
        </div>
    </section>
</template>

<style scoped></style>
