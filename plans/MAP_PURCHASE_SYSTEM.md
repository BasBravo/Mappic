# Plan: Sistema de Compra de Mapas

**Fecha**: Noviembre 12, 2025
**Estado**: En Planificación
**Prioridad**: Alta

---

## 📋 Resumen Ejecutivo

Implementar un sistema completo que permita a los usuarios comprar mapas generados por otros usuarios de la plataforma. Los mapas tendrán un costo de créditos equivalente a la mitad del costo de generación desde cero.

---

## 🎯 Objetivos

1. ✅ Permitir a todos los usuarios explorar mapas de otros usuarios
2. ✅ Mostrar opción de compra a los usuarios autenticados en mapas que no son del usuario
3. ✅ Procesar compra de mapas deduciendo créditos
4. ✅ Crear copia del mapa para el usuario comprador
5. ✅ Mantener integridad de datos y referencias

---

## 📊 Estructura de Costos

### Costos de Generación (Actual)

```javascript
{
  s: 1 crédito,      // small
  m: 2 créditos,     // medium
  l: 5 créditos,     // large
  xl: 10 créditos,   // high
  xxl: 12 créditos   // ultrahigh
}
```

### Costos de Compra (Nueva)

```javascript
{
  m: 1 crédito
  l: 3 créditos
  xl: 5 créditos
  xxl: 6 créditos
}
```

**Nota**: Los mapas generados con tamaño "small" no se pueden comprar y no aparecen en la lista de mapas para comprar.

---

## 🏗️ Arquitectura de Implementación

### 1. Capa de Datos (`data/credits.ts`)

**Cambios**:

-   ✅ Agregar objeto `mapPurchaseCosts` con costos de compra
-   ✅ Función `getMapPurchaseCost(size)` - retorna costo de compra
-   ✅ Función `canPurchaseMap(userCredits, mapSize)` - valida si puede comprar
-   ✅ Función `getMapPurchaseCostFromGenerationCost(generationCost)` - calcula desde costo de generación

**Código**:

```typescript
export const mapPurchaseCosts = {
    m: { cost: 1, name: 'medium' },
    l: { cost: 3, name: 'large' },
    xl: { cost: 5, name: 'high' },
    xxl: { cost: 6, name: 'ultrahigh' },
} as const;

export const getMapPurchaseCost = (size: string): number => {
    return mapPurchaseCosts[size.toLowerCase() as keyof typeof mapPurchaseCosts]?.cost || 1;
};

export const getMapPurchaseCostFromGenerationCost = (generationCost: number): number => {
    return Math.ceil(generationCost / 2);
};

export const canPurchaseMap = (userCredits: number, mapSize: string): boolean => {
    const cost = getMapPurchaseCost(mapSize);
    return userCredits >= cost;
};
```

---

### 2. Servicio de Compra (`shared/services/mapPurchase.ts`)

**Responsabilidades**:

-   Validar autenticación del usuario
-   Validar créditos suficientes
-   Crear copia del mapa con nuevo propietario
-   Deducir créditos del usuario
-   Registrar transacción

**Funciones**:

```typescript
export async function purchaseMap(
    mapId: string,
    buyerId: string
): Promise<{
    success: boolean;
    message: string;
    newMapId?: string;
    costDeducted?: number;
}>;

export async function validatePurchaseEligibility(
    mapId: string,
    buyerId: string
): Promise<{
    canPurchase: boolean;
    reason?: string;
    cost?: number;
}>;
```

---

### 3. Página de Exploración (`app/pages/maps/explore.vue`)

**Características**:

-   ✅ Listado paginado de mapas de todos los usuarios
-   ✅ Filtros: calidad, estilo, composición
-   ✅ Búsqueda por título/ubicación
-   ✅ Información del creador (nombre, avatar)
-   ✅ Mostrar costo de compra en cada mapa
-   ✅ Indicador visual si ya posee el mapa
-   ✅ Botón para ver detalles/comprar
-   ✅ No deben aparecer mapas de tamaño "small"
-   ✅ No deben aparecer mapas que pertenecen al usuario autenticado

**Estructura**:

```vue
<template>
    <div class="explore-maps">
        <!-- Filtros y búsqueda -->
        <FilterSection />

        <!-- Grid de mapas -->
        <MapsGrid :maps="filteredMaps" />

        <!-- Paginación -->
        <Pagination />
    </div>
</template>
```

**Datos**:

-   `maps`: Array de mapas de todos los usuarios
-   `filters`: { quality, style, composition, search }
-   `pagination`: { page, pageSize, total }
-   `loading`: boolean

---

### 4. Página de Compra (`app/pages/maps/buy.vue`)

**Características**:

-   ✅ Mostrar detalles completos del mapa
-   ✅ Mostrar costo en créditos
-   ✅ Mostrar créditos disponibles del usuario
-   ✅ Validar suficiencia de créditos
-   ✅ Botón de confirmar compra
-   ✅ Mensaje de éxito/error
-   ✅ Redirigir a mapa comprado tras éxito

**Flujo**:

```
1. Usuario llega a /maps/buy?uid=<mapId>
2. Se carga información del mapa
3. Se valida que no sea propietario
4. Se muestra costo y créditos disponibles
5. Usuario confirma compra
6. Se procesa compra (deducir créditos, crear copia)
7. Se redirige a /maps/<newMapId>
```

**Estructura**:

```vue
<template>
    <div class="buy-map">
        <!-- Información del mapa -->
        <MapPreview :map="mapData" />

        <!-- Detalles de compra -->
        <PurchaseDetails :cost="purchaseCost" :userCredits="userCredits" />

        <!-- Botón de confirmación -->
        <ConfirmButton @click="processPurchase" :disabled="!canPurchase" />
    </div>
</template>
```

---

### 5. Componente SharedOptions.vue (Modificación)

**Cambios**:

-   ✅ Agregar botón "Buy map" en la sección de opciones para no-propietarios
-   ✅ Mostrar costo de compra en el botón o tooltip
-   ✅ Validar autenticación antes de permitir compra
-   ✅ Redirigir a página de compra

**Ubicación en template**:

```vue
<!-- Después del botón de voto, antes de "Edit map" -->
<UButton @click="buyMap" :label="`${$t('Buy map')} (${purchaseCost} credits)`" icon="i-tabler-shopping-cart" color="primary" size="xl" />
```

**Lógica**:

```javascript
const purchaseCost = computed(() => {
    if (!mapData.value) return 0;
    return getMapPurchaseCost(mapData.value.quality);
});

const buyMap = () => {
    const currentUser = authStore.user;
    if (!currentUser?.uid) {
        navigateTo('/auth/login');
        return;
    }
    navigateTo(`/maps/buy?uid=${props.uid}`);
};
```

---

### 6. Tipos TypeScript (`types/maps.d.ts`)

**Nuevos tipos**:

```typescript
interface MapPurchaseTransaction {
    id: string;
    originalMapId: string;
    newMapId: string;
    buyerId: string;
    sellerId: string;
    cost: number;
    timestamp: FirestoreDate;
    status: 'pending' | 'completed' | 'failed';
}

interface MapPurchaseResponse {
    success: boolean;
    message: string;
    newMapId?: string;
    transaction?: MapPurchaseTransaction;
}
```

---

### 7. Traducciones

**Claves a agregar** (`i18n/locales/en.js`, `es.js`, `zh.js`):

```javascript
// Exploración de mapas
maps: {
    explore: {
        title: 'Explore Maps',
        description: 'Discover beautiful maps created by our community',
        search: 'Search maps...',
        filters: 'Filters',
        noMaps: 'No maps found',
        creator: 'Created by',
        cost: 'Cost',
        buy: 'Buy map',
        owned: 'You own this map',
    },
    purchase: {
        title: 'Buy map',
        cost: 'Cost',
        credits: 'Credits',
        available: 'Available',
        insufficient: 'Insufficient credits',
        confirm: 'Confirm Purchase',
        success: 'Map purchased successfully!',
        error: 'Error purchasing map',
        alreadyOwned: 'You already own this map',
        cannotBuyOwn: 'You cannot buy your own map',
    }
}
```

---

## 📁 Archivos a Crear/Modificar

### Crear (Nuevos)

-   [ ] `shared/services/mapPurchase.ts` - Servicio de compra
-   [ ] `app/pages/maps/explore.vue` - Página de exploración
-   [ ] `app/pages/maps/buy.vue` - Página de compra
-   [ ] `types/mapPurchase.d.ts` - Tipos para compra (opcional)

### Modificar (Existentes)

-   [ ] `data/credits.ts` - Agregar costos de compra
-   [ ] `app/components/map/SharedOptions.vue` - Agregar botón de compra
-   [ ] `i18n/locales/en.js` - Agregar traducciones
-   [ ] `i18n/locales/es.js` - Agregar traducciones
-   [ ] `i18n/locales/zh.js` - Agregar traducciones

---

## 🔄 Flujos de Usuario

### Flujo 1: Explorar y Comprar Mapa

```
1. Usuario accede a /maps/explore
2. Ve listado de mapas con filtros
3. Busca o filtra mapas
4. Hace click en un mapa
5. Ve detalles en /maps/[uid]
6. Hace click en "Buy map"
7. Va a /maps/buy?uid=<mapId>
8. Confirma compra
9. Se deduce créditos
10. Se crea copia del mapa
11. Se redirige a /maps/<newMapId>
12. Nuevo mapa aparece en "My Maps"
```

### Flujo 2: Compra desde Vista de Mapa

```
1. Usuario está en /maps/[uid] (mapa de otro)
2. Ve botón "Buy map" en SharedOptions
3. Hace click
4. Va a /maps/buy?uid=<mapId>
5. Confirma compra
6. Proceso igual al Flujo 1
```

### Flujo 3: Validaciones

```
Antes de permitir compra:
✓ Usuario está autenticado
✓ Usuario NO es propietario del mapa
✓ Usuario tiene suficientes créditos
✓ Mapa existe y está disponible
✓ Usuario no ha comprado este mapa antes (opcional)
```

---

## 🔐 Consideraciones de Seguridad

1. **Validación en Backend**:

    - Verificar que el usuario está autenticado
    - Verificar que tiene suficientes créditos
    - Verificar que no es propietario
    - Deducir créditos de forma atómica

2. **Prevención de Duplicados**:

    - Verificar si el usuario ya posee una copia
    - Evitar compras múltiples del mismo mapa

3. **Auditoría**:
    - Registrar todas las transacciones
    - Mantener historial de compras

---

## 📈 Métricas de Éxito

-   ✅ Usuarios pueden explorar mapas de otros
-   ✅ Usuarios pueden comprar mapas con créditos
-   ✅ Mapas comprados aparecen en "My Maps"
-   ✅ Créditos se deducen correctamente
-   ✅ No hay errores de duplicación
-   ✅ Transacciones se registran correctamente

---

## 🚀 Fases de Implementación

### Fase 1: Backend (Servicios)

1. Crear `mapPurchase.ts` con lógica de compra
2. Agregar costos a `credits.ts`
3. Agregar tipos

### Fase 2: Frontend (Páginas)

1. Crear `explore.vue`
2. Crear `buy.vue`
3. Modificar `SharedOptions.vue`

### Fase 3: Traducción e Integración

1. Agregar traducciones
2. Pruebas de flujo completo
3. Ajustes y refinamientos

---

## 📝 Notas Adicionales

-   Los mapas comprados son copias independientes (no referencias)
-   El usuario comprador es el nuevo propietario
-   Puede editar, regenerar o eliminar su copia
-   El mapa original permanece intacto
-   Se puede comprar el mismo mapa múltiples veces (cada compra es una copia nueva)

---

## ✅ Checklist de Implementación

-   [ ] Fase 1: Backend completado
-   [ ] Fase 2: Frontend completado
-   [ ] Fase 3: Traducción completada
-   [ ] Pruebas de flujo completo
-   [ ] Validación de seguridad
-   [ ] Documentación actualizada
-   [ ] Deploy a producción
