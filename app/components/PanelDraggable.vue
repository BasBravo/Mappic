<script setup>
const props = defineProps({
    title: {
        type: String,
        default: 'Panel',
    },
    initialX: {
        type: Number,
        default: 100,
    },
    initialY: {
        type: Number,
        default: 100,
    },
    minWidth: {
        type: Number,
        default: 300,
    },
    maxWidth: {
        type: Number,
        default: 600,
    },
    zIndex: {
        type: Number,
        default: 50,
    },
});

const emit = defineEmits(['close', 'focus']);

// Panel position and dragging state
const panelRef = ref(null);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const position = ref({ x: props.initialX, y: props.initialY });

// Mouse event handlers
function onMouseDown(event) {
    // Focus this panel when clicked anywhere
    focusPanel();

    if (event.target.closest('.panel-header')) {
        isDragging.value = true;
        dragOffset.value = {
            x: event.clientX - position.value.x,
            y: event.clientY - position.value.y,
        };

        // Add global mouse event listeners
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Prevent text selection during drag
        document.body.style.userSelect = 'none';
        event.preventDefault();
    }
}

function focusPanel() {
    emit('focus');
}

function onPanelClick(event) {
    // Focus panel when clicking anywhere on it (not just header)
    focusPanel();
}

function onMouseMove(event) {
    if (!isDragging.value) return;

    // Use viewport coordinates to ensure fixed positioning during scroll
    const newX = event.clientX - dragOffset.value.x;
    const newY = event.clientY - dragOffset.value.y;

    // Obtener dimensiones del panel y de la ventana
    // Acceder al elemento DOM del componente EffectGlass
    const panelElement = panelRef.value?.$el || panelRef.value;
    const panelRect = panelElement?.getBoundingClientRect();
    const panelWidth = panelRect?.width || 0;
    const panelHeight = panelRect?.height || 0;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Restringir movimiento para que el panel nunca salga de la pantalla
    const maxX = windowWidth - panelWidth;
    const maxY = windowHeight - panelHeight;
    const minX = 0;
    const minY = 0;

    position.value = {
        x: Math.max(minX, Math.min(newX, maxX)),
        y: Math.max(minY, Math.min(newY, maxY)),
    };
}
function onMouseUp() {
    isDragging.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.userSelect = '';
}

function closePanel() {
    emit('close');
}

// Función para validar y ajustar posición dentro de los límites de pantalla
function validatePosition() {
    if (!panelRef.value) return;

    // Acceder al elemento DOM del componente EffectGlass
    const panelElement = panelRef.value?.$el || panelRef.value;
    if (!panelElement?.getBoundingClientRect) return;

    const panelRect = panelElement.getBoundingClientRect();
    const panelWidth = panelRect.width;
    const panelHeight = panelRect.height;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const maxX = windowWidth - panelWidth;
    const maxY = windowHeight - panelHeight;
    const minX = 0;
    const minY = 0;

    const newX = Math.max(minX, Math.min(position.value.x, maxX));
    const newY = Math.max(minY, Math.min(position.value.y, maxY));

    // Solo actualizar si la posición cambió
    if (newX !== position.value.x || newY !== position.value.y) {
        position.value = { x: newX, y: newY };
    }
} // Cleanup on unmount
onUnmounted(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.userSelect = '';
    window.removeEventListener('resize', validatePosition);
    window.removeEventListener('scroll', onScroll);
});

// Handle scroll to maintain fixed position
function onScroll() {
    // Panels should maintain their viewport position during scroll
    // Since we're using position: fixed, this shouldn't be necessary,
    // but we'll ensure the position stays stable
    if (panelRef.value && position.value) {
        const panelElement = panelRef.value?.$el || panelRef.value;
        if (panelElement) {
            panelElement.style.position = 'fixed';
            panelElement.style.left = position.value.x + 'px';
            panelElement.style.top = position.value.y + 'px';
        }
    }
}

// Agregar listener para redimensionado de ventana y scroll
onMounted(() => {
    window.addEventListener('resize', validatePosition);
    window.addEventListener('scroll', onScroll, { passive: true });
    // Validar posición inicial
    nextTick(() => {
        validatePosition();
    });
});
</script>

<template>
    <Teleport to="body">
        <EffectGlass
            :displace="4"
            ref="panelRef"
            class="fixed rounded-3xl shadow-2xl overflow-hidden"
            :style="{
                position: 'fixed',
                left: position.x + 'px',
                top: position.y + 'px',
                minWidth: minWidth + 'px',
                maxWidth: maxWidth + 'px',
                cursor: isDragging ? 'grabbing' : 'default',
                zIndex: zIndex,
            }"
            @mousedown="onMouseDown"
            @click="onPanelClick">
            <div class="flex flex-col w-full">
                <!-- Panel Header -->
                <div class="panel-header flex items-center justify-between p-4 px-6 pr-4 bg-black/5 cursor-grab active:cursor-grabbing">
                    <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                    <UButton icon="i-tabler-x" variant="ghost" size="lg" @click="closePanel" />
                </div>

                <!-- Panel Content -->
                <div class="panel-content p-6 pb-8 max-h-[80vh] overflow-y-auto">
                    <slot />
                </div>
            </div>
        </EffectGlass>
    </Teleport>
</template>

<style scoped>
.panel-header {
    user-select: none;
}

/* Ensure panel stays fixed during scroll */
:deep(.fixed) {
    position: fixed !important;
}
</style>
