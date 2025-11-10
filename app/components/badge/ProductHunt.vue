<script setup>
//
// VARS
//
const width = 190;
const height = 40;
</script>

<template>
    <div class="fixed right-3 bottom-3 z-50">
        <a
            href="https://www.producthunt.com/posts/mappic?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-mappic"
            target="_blank">
            <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=462423&theme=dark"
                alt="mappic - Generate&#0032;high&#0045;res&#0032;city&#0032;map&#0032;posters | Product Hunt"
                :style="{ width: `${width}px`, height: `${height}px` }"
                :width="width"
                :height="height" />
        </a>
    </div>
</template>
