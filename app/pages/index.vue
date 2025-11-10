<script setup>
// Composables para sanitización segura
const { sanitizeI18nContent } = useSanitizer();
import { useMapStore } from '~~/stores/mapStore';

// Store para manejar la localización seleccionada
const mapStore = useMapStore();

useHead({
    title: 'Mappic - Create Beautiful Maps',
    meta: [
        {
            name: 'description',
            content: 'Create high-resolution maps of your favorite cities with beautiful, minimalist design.',
        },
    ],
});

// Función para manejar la selección de localización
const handleLocationSelected = location => {
    // Guardar la localización en el store
    mapStore.setSelectedLocation(location);

    // Navegar a la página del editor
    navigateTo('/maps/editor');
};
</script>

<template>
    <div class="w-full">
        <BadgeProductHunt class="hidden md:flex" />

        <!-- Title -->
        <ClientOnly>
            <teleport to="#SidebarBottom">
                <div class="fixed flex top-0 bottom-0 py-6 left-12 z-10 h-dvh justify-center items-end text-black/60">
                    <div class="text-xs transform [writing-mode:vertical-rl] rotate-180">
                        {{ $t('maps created by users') }}
                    </div>
                </div>
            </teleport>
        </ClientOnly>

        <!-- Espacio inicial -->
        <div class="h-46" />

        <div class="pb-20 xl:px-20 max-w-6xl">
            <h1 class="text-5xl md:text-7xl max-w-2xl font-medium tracking-tight text-pretty text-gray-900">
                {{ $t('home.title') }}
            </h1>
            <p class="hidden md:flex mt-8 text-2xl text-pretty" v-html="sanitizeI18nContent($t('home.slogan'))"></p>
            <p class="flex md:hidden mt-8 text-lg text-pretty" v-html="sanitizeI18nContent($t('home.slogan_mobile'))"></p>
            <div class="mt-10 w-full flex flex-col gap-4">
                <!-- Buscador de ubicaciones -->
                <div class="hidden md:flex justify-start max-w-3xl">
                    <InputSearchLocation :placeholder="$t('Search for locations...')" @location-selected="handleLocationSelected" />
                </div>
                <!-- Botón para continuar editando mapa existente -->
                <div v-if="mapStore.selectedLocation" class="flex justify-start">
                    <UButton :to="'/maps/editor'" size="lg" icon="i-tabler-pencil">
                        {{ $t('Continue editing') }}: {{ mapStore.mapTitle }}
                    </UButton>
                </div>
            </div>
        </div>
        <!-- GRID DE MAPAS  -->
        <div class="w-full py-10">
            <MapsGrid />
        </div>
    </div>
</template>
