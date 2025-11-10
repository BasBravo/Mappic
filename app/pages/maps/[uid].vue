<script setup>
import { createMapService } from '~~/shared/services/map';

// Route params
const route = useRoute();
const uid = route.params.uid;

// Services
const mapService = createMapService();

// Reactive data
const mapData = ref(null);
const loading = ref(true);
const error = ref(false);
const imageUrl = ref('');

// Get map data
async function getMapData() {
    try {
        loading.value = true;
        error.value = false;

        const result = await mapService.getMap(uid, { deep: true });

        if (result.success) {
            mapData.value = result.data;
            imageUrl.value = result.data?._references?.file_map_resized?.url || result.data?._references?.file_map?.url;
        } else {
            error.value = true;
        }
    } catch (err) {
        console.error('Error fetching map data:', err);
        error.value = true;
    } finally {
        loading.value = false;
    }
}

// Current URL for sharing
const currentUrl = ref('');

// Social sharing functions
const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this beautiful map: ${mapData.value?.title || 'Untitled Map'}`);
    const url = encodeURIComponent(currentUrl.value);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
};

const shareOnFacebook = () => {
    const url = encodeURIComponent(currentUrl.value);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
};

const shareOnLinkedIn = () => {
    const url = encodeURIComponent(currentUrl.value);
    const title = encodeURIComponent(mapData.value?.title || 'Untitled Map');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
};

const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this beautiful map: ${mapData.value?.title || 'Untitled Map'} ${currentUrl.value}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
};

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(currentUrl.value);
        // You could add a toast notification here
        alert('URL copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy URL:', err);
    }
};

// SEO Meta tags
const seoTitle = computed(() => {
    if (!mapData.value) return 'Map | Mappic';
    return `${mapData.value.design?.title} - Beautiful Map | Mappic`;
});

const seoDescription = computed(() => {
    if (!mapData.value) return 'Explore beautiful maps created with Mappic';
    const location = mapData.value.location?.display_name || 'Unknown location';
    return `Explore this beautiful map of ${location}. Created with Mappic - Create high-resolution maps in seconds.`;
});

const seoImage = computed(() => {
    return imageUrl.value || '/default-map-preview.jpg';
});

// Set current URL on mount
onMounted(() => {
    currentUrl.value = window.location.href;
    getMapData();
});

// Dynamic meta tags
useHead({
    title: seoTitle,
    meta: [
        { name: 'description', content: seoDescription },
        { name: 'keywords', content: 'map, mappic, city map, beautiful maps, high resolution maps' },

        // Open Graph
        { property: 'og:title', content: seoTitle },
        { property: 'og:description', content: seoDescription },
        { property: 'og:image', content: seoImage },
        { property: 'og:url', content: currentUrl },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Mappic' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: seoTitle },
        { name: 'twitter:description', content: seoDescription },
        { name: 'twitter:image', content: seoImage },

        // Additional SEO
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'Mappic' },
    ],
    link: [{ rel: 'canonical', href: currentUrl }],
});
</script>

<template>
    <div class="relative w-full min-h-[calc(100dvh-4rem)] flex justify-center items-center">
        <div class="fixed left-0 md:left-20 right-0 flex justify-center bottom-4 px-6 py-3 z-10">
            <MapSharedOptions :uid="uid" />
        </div>

        <div class="flex flex-col gap-6 w-full max-w-[700px] my-auto py-20">
            <MapStatic :uid="uid" :interactive="false" />
        </div>
    </div>
</template>
