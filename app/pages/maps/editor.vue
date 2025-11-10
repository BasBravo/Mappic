<script setup>
import { useMapStore } from '~~/stores/mapStore';

// Store para acceder a la localización seleccionada
const mapStore = useMapStore();

// Referencia al componente MapBase para controlar el zoom
const mapBaseRef = ref(null);

// Redirigir a home si no hay localización seleccionada
if (!mapStore.hasSelectedLocation) {
    navigateTo('/');
}

useHead({
    title: 'Mappic - Map Editor',
    meta: [
        {
            name: 'description',
            content: 'Edit and customize your map with beautiful, minimalist design.',
        },
    ],
});
</script>

<template>
    <div>
        <div class="hidden md:flex fixed left-0 right-0 justify-center bottom-6 z-10">
            <MapSettigns :map-base-ref="mapBaseRef"></MapSettigns>
        </div>

        <div
            class="hidden md:flex md:-translate-x-12 justify-center items-center w-full min-h-[calc(100dvh-4rem)] max-w-[1200px] mx-auto py-20">
            <MapBase
                ref="mapBaseRef"
                class="-translate-y-4"
                @map-loaded="onMapLoaded"
                @map-moved="onMapMoved"
                @zoom-changed="onZoomChanged" />
        </div>

        <div class="md:hidden w-full h-full">
            <div class="flex flex-col items-center justify-center h-full">
                <p class="text-gray-500 text-lg">{{ $t('Map editor not available on mobile') }}</p>
                <p class="text-gray-400 text-sm">{{ $t('Please use a desktop browser to access the map editor.') }}</p>
            </div>
        </div>
    </div>
</template>
