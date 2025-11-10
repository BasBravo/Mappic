<template>
    <div
        ref="containerRef"
        :class="[glassSurfaceClasses, focusVisibleClasses, className]"
        :style="containerStyles"
        v-bind="$attrs"
        class="shadow-xl shadow-black/5 border border-black/10 bg-white/80 will-change-auto">
        <svg class="w-full h-full pointer-events-none absolute inset-0 opacity-0 -z-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter :id="filterId" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
                    <feImage ref="feImageRef" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

                    <feDisplacementMap ref="redChannelRef" in="SourceGraphic" in2="map" id="redchannel" result="dispRed" />
                    <feColorMatrix
                        in="dispRed"
                        type="matrix"
                        values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
                        result="red" />

                    <feDisplacementMap ref="greenChannelRef" in="SourceGraphic" in2="map" id="greenchannel" result="dispGreen" />
                    <feColorMatrix
                        in="dispGreen"
                        type="matrix"
                        values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
                        result="green" />

                    <feDisplacementMap ref="blueChannelRef" in="SourceGraphic" in2="map" id="bluechannel" result="dispBlue" />
                    <feColorMatrix
                        in="dispBlue"
                        type="matrix"
                        values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
                        result="blue" />

                    <feBlend in="red" in2="green" mode="screen" result="rg" />
                    <feBlend in="rg" in2="blue" mode="screen" result="output" />
                    <feGaussianBlur ref="gaussianBlurRef" in="output" stdDeviation="0.7" />
                </filter>
            </defs>
        </svg>

        <div :class="slotClasses">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, type CSSProperties, useTemplateRef, onMounted, computed, watch, nextTick, onUnmounted, useAttrs } from 'vue';

defineOptions({
    inheritAttrs: false,
});

interface GlassSurfaceProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: number;
    borderWidth?: number;
    brightness?: number;
    opacity?: number;
    blur?: number;
    displace?: number;
    backgroundOpacity?: number;
    saturation?: number;
    distortionScale?: number;
    redOffset?: number;
    greenOffset?: number;
    blueOffset?: number;
    xChannel?: 'R' | 'G' | 'B';
    yChannel?: 'R' | 'G' | 'B';
    mixBlendMode?:
        | 'normal'
        | 'multiply'
        | 'screen'
        | 'overlay'
        | 'darken'
        | 'lighten'
        | 'color-dodge'
        | 'color-burn'
        | 'hard-light'
        | 'soft-light'
        | 'difference'
        | 'exclusion'
        | 'hue'
        | 'saturation'
        | 'color'
        | 'luminosity'
        | 'plus-darker'
        | 'plus-lighter';
    className?: string;
    style?: CSSProperties;
    disableDimensions?: boolean;
}

const props = withDefaults(defineProps<GlassSurfaceProps>(), {
    width: '200px',
    height: '200px',
    borderRadius: 20,
    borderWidth: 0.07,
    brightness: 70,
    opacity: 0.93,
    blur: 11,
    displace: 0.5,
    backgroundOpacity: 0,
    saturation: 1,
    distortionScale: -180,
    redOffset: 0,
    greenOffset: 10,
    blueOffset: 20,
    xChannel: 'R',
    yChannel: 'G',
    mixBlendMode: 'difference',
    className: '',
    style: () => ({}),
    disableDimensions: false,
});

const $attrs = useAttrs();

const isDarkMode = ref(false);

const updateDarkMode = () => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkMode.value = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
        isDarkMode.value = e.matches;
    };

    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
};

// Generate unique IDs for SVG elements
const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15);
};

const uniqueId = generateUniqueId();
const filterId = `glass-filter-${uniqueId}`;
const redGradId = `red-grad-${uniqueId}`;
const blueGradId = `blue-grad-${uniqueId}`;

const containerRef = useTemplateRef<HTMLDivElement>('containerRef');
const feImageRef = useTemplateRef<SVGSVGElement>('feImageRef');
const redChannelRef = useTemplateRef<SVGSVGElement>('redChannelRef');
const greenChannelRef = useTemplateRef<SVGSVGElement>('greenChannelRef');
const blueChannelRef = useTemplateRef<SVGSVGElement>('blueChannelRef');
const gaussianBlurRef = useTemplateRef<SVGSVGElement>('gaussianBlurRef');

let resizeObserver: ResizeObserver | null = null;

const generateDisplacementMap = () => {
    const rect = containerRef.value?.getBoundingClientRect();
    const actualWidth = Math.round(rect?.width || 400);
    const actualHeight = Math.round(rect?.height || 200);
    const edgeSize = Math.round(Math.min(actualWidth, actualHeight) * (props.borderWidth * 0.5));

    // Pre-calculate values para evitar repetir cálculos
    const innerWidth = actualWidth - edgeSize * 2;
    const innerHeight = actualHeight - edgeSize * 2;

    // Template string más eficiente
    const svgContent = `<svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient><linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient></defs><rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"/><rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${props.borderRadius}" fill="url(#${redGradId})"/><rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${props.borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode:${props.mixBlendMode}"/><rect x="${edgeSize}" y="${edgeSize}" width="${innerWidth}" height="${innerHeight}" rx="${props.borderRadius}" fill="hsl(0 0% ${props.brightness}% / ${props.opacity})" style="filter:blur(${props.blur}px)"/></svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
};

let cachedMap: string | null = null;
let lastDimensions: { width: number; height: number } | null = null;

const updateDisplacementMap = () => {
    if (!feImageRef.value) return;

    const rect = containerRef.value?.getBoundingClientRect();
    if (!rect) return;

    const currentDimensions = { width: rect.width, height: rect.height };

    // Cache para evitar regenerar si las dimensiones no cambiaron
    if (
        lastDimensions &&
        lastDimensions.width === currentDimensions.width &&
        lastDimensions.height === currentDimensions.height &&
        cachedMap
    ) {
        return;
    }

    cachedMap = generateDisplacementMap();
    lastDimensions = currentDimensions;
    feImageRef.value.setAttribute('href', cachedMap);
};

const supportsSVGFilters = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);

    if (isWebkit || isFirefox) {
        return false;
    }

    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${filterId})`;
    return div.style.backdropFilter !== '';
};

const supportsBackdropFilter = () => {
    if (typeof window === 'undefined') return false;
    return CSS.supports('backdrop-filter', 'blur(10px)');
};

const containerStyles = computed(() => {
    const baseStyles: Record<string, string | number> = {
        ...props.style,
        '--glass-frost': props.backgroundOpacity,
        '--glass-saturation': props.saturation,
        // Optimizaciones para performance
        transform: 'translateZ(0)', // Crear nuevo stacking context
        backfaceVisibility: 'hidden', // Optimizar para animaciones 3D
    };

    // Solo aplicar dimensiones y border-radius si no hay clases externas que las controlen
    const hasExternalClasses = props.className || Object.keys($attrs).some(key => key.startsWith('class'));

    if (!hasExternalClasses && !props.disableDimensions) {
        baseStyles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
        baseStyles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
        baseStyles.borderRadius = `${props.borderRadius}px`;
    }

    const svgSupported = supportsSVGFilters();
    const backdropFilterSupported = supportsBackdropFilter();

    if (svgSupported) {
        // Detectar si hay clase de background aplicada (incluyendo clases hardcoded del template)
        const templateClasses = 'shadow-xl shadow-black/5 border border-black/10 bg-white/90 will-change-auto';
        const hasBackgroundClass =
            templateClasses.includes('bg-') ||
            ($attrs.class && typeof $attrs.class === 'string' && $attrs.class.includes('bg-')) ||
            props.className.includes('bg-');

        const backgroundStyle = hasBackgroundClass
            ? {}
            : {
                  background: isDarkMode.value
                      ? `hsl(0 0% 0% / ${props.backgroundOpacity})`
                      : `hsl(0 0% 100% / ${props.backgroundOpacity})`,
              };

        return {
            ...baseStyles,
            ...backgroundStyle,
            backdropFilter: `url(#${filterId}) saturate(${props.saturation})`,
        };
    } else {
        // Detectar si hay clase de background aplicada (misma lógica para fallbacks)
        const templateClasses = 'shadow-xl shadow-black/5 border border-black/10 bg-white/90 will-change-auto';
        const hasBackgroundClass =
            templateClasses.includes('bg-') ||
            ($attrs.class && typeof $attrs.class === 'string' && $attrs.class.includes('bg-')) ||
            props.className.includes('bg-');

        if (isDarkMode.value) {
            if (!backdropFilterSupported) {
                const backgroundStyle = hasBackgroundClass ? {} : { background: 'rgba(0, 0, 0, 0.4)' };

                return {
                    ...baseStyles,
                    ...backgroundStyle,
                };
            } else {
                const backgroundStyle = hasBackgroundClass ? {} : { background: 'rgba(255, 255, 255, 0.1)' };

                return {
                    ...baseStyles,
                    ...backgroundStyle,
                    backdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
                    WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
                };
            }
        } else {
            if (!backdropFilterSupported) {
                const backgroundStyle = hasBackgroundClass ? {} : { background: 'rgba(255, 255, 255, 0.4)' };

                return {
                    ...baseStyles,
                    ...backgroundStyle,
                };
            } else {
                const backgroundStyle = hasBackgroundClass ? {} : { background: 'rgba(255, 255, 255, 0.25)' };

                return {
                    ...baseStyles,
                    ...backgroundStyle,
                    backdropFilter: 'blur(12px) saturate(1.8) brightness(1.1)',
                    WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.1)',
                };
            }
        }
    }
});

const glassSurfaceClasses = computed(() => {
    // Solo clases esenciales para el funcionamiento del glass effect
    return 'relative';
});

const slotClasses = computed(() => {
    const baseClasses = 'relative z-10';

    // Detectar si el contenedor padre tiene clases flex
    const hasFlexClasses =
        $attrs.class && typeof $attrs.class === 'string' && ($attrs.class.includes('flex') || props.className.includes('flex'));

    if (hasFlexClasses) {
        // Si el padre es flex, no forzar dimensiones - permitir que se ajusten naturalmente
        return `flex items-center gap-inherit ${baseClasses}`;
    } else {
        // Si no es flex, usar dimensiones completas y centrar
        return `w-full h-full flex items-center justify-center ${baseClasses}`;
    }
});

const focusVisibleClasses = computed(() => {
    return isDarkMode.value
        ? 'focus-visible:outline-2 focus-visible:outline-[#0A84FF] focus-visible:outline-offset-2'
        : 'focus-visible:outline-2 focus-visible:outline-[#007AFF] focus-visible:outline-offset-2';
});

const updateFilterElements = () => {
    const elements = [
        { ref: redChannelRef, offset: props.redOffset },
        { ref: greenChannelRef, offset: props.greenOffset },
        { ref: blueChannelRef, offset: props.blueOffset },
    ];

    elements.forEach(({ ref, offset }) => {
        if (ref.value) {
            ref.value.setAttribute('scale', (props.distortionScale + offset).toString());
            ref.value.setAttribute('xChannelSelector', props.xChannel);
            ref.value.setAttribute('yChannelSelector', props.yChannel);
        }
    });

    if (gaussianBlurRef.value) {
        gaussianBlurRef.value.setAttribute('stdDeviation', props.displace.toString());
    }
};

let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

const setupResizeObserver = () => {
    if (!containerRef.value || typeof ResizeObserver === 'undefined') return;

    resizeObserver = new ResizeObserver(() => {
        // Debounce resize events para mejor performance
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateDisplacementMap();
            resizeTimeout = null;
        }, 16); // ~60fps
    });

    resizeObserver.observe(containerRef.value);
};

let updateTimeout: ReturnType<typeof setTimeout> | null = null;

// Separar watchers por tipo de update para mejor performance
watch(
    [
        () => props.width,
        () => props.height,
        () => props.borderRadius,
        () => props.borderWidth,
        () => props.brightness,
        () => props.opacity,
        () => props.blur,
        () => props.mixBlendMode,
    ],
    () => {
        // Debounce displacement map updates
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            updateDisplacementMap();
            updateTimeout = null;
        }, 16);
    }
);

// Watcher separado para filter elements (más ligero)
watch(
    [
        () => props.displace,
        () => props.distortionScale,
        () => props.redOffset,
        () => props.greenOffset,
        () => props.blueOffset,
        () => props.xChannel,
        () => props.yChannel,
    ],
    () => {
        requestAnimationFrame(updateFilterElements);
    }
);

onMounted(() => {
    const cleanup = updateDarkMode();

    nextTick(() => {
        updateDisplacementMap();
        updateFilterElements();
        setupResizeObserver();
    });

    onUnmounted(() => {
        if (cleanup) cleanup();
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
            resizeTimeout = null;
        }
        if (updateTimeout) {
            clearTimeout(updateTimeout);
            updateTimeout = null;
        }
        // Clear cache
        cachedMap = null;
        lastDimensions = null;
    });
});
</script>
