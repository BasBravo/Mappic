# Implementación de Explore Maps con Paginación del Lado del Servidor

## 📋 Resumen

Se ha creado una nueva función `getExploreMaps()` en `shared/services/map.ts` que realiza consultas directas a Firestore sin usar `pleg-connect`, con soporte completo para:

-   ✅ Filtros (quality, style, composition)
-   ✅ Ordenamiento múltiple (votes desc + created_at desc)
-   ✅ Paginación del lado del servidor
-   ✅ Conteo total de documentos

## 🔧 Archivos Modificados

### 1. `shared/services/map.ts`

**Imports agregados**:

```typescript
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    getCountFromServer,
    type QueryConstraint,
    type DocumentSnapshot,
} from 'firebase/firestore';
```

**Método nuevo**: `getExploreMaps(options)`

**Parámetros**:

```typescript
{
    filters: {
        quality?: string,      // 'all' | 'medium' | 'high' | 'superhigh' | 'ultrahigh'
        style?: string,        // 'all' | 'standard' | 'dark' | 'light' | ...
        composition?: string,  // 'all' | 'simple' | 'detailed' | ...
        search?: string        // Búsqueda de texto (no implementado aún)
    },
    sort?: string,             // 'votes' | 'date'
    pagination: {
        page: number,          // Número de página (1-indexed)
        pageSize: number       // Tamaño de página (default: 50)
    }
}
```

**Retorno**:

```typescript
{
    success: boolean,
    items: Array<Map>,    // Mapas de la página actual
    total: number,        // Total de mapas (para paginación)
    pages: number,        // Total de páginas
    page: number,         // Página actual
    pageSize: number      // Tamaño de página
}
```

**Características**:

1. **Filtros Base** (siempre aplicados):

    - `quality != 's'` (excluir mapas pequeños)
    - `status == 'success'` (solo mapas generados exitosamente)
    - `is_purchased_copy == false` (excluir copias compradas)

2. **Ordenamiento**:

    - **Requerido**: `quality asc` (Firestore requiere ordenar campos con `!=` primero)
    - **Most Voted**: `votes desc` → `created_at desc`
    - **Most Recent**: `created_at desc`

3. **Paginación**:
    - Usa `startAfter()` para paginación eficiente
    - Calcula el último documento de la página anterior
    - Usa `getCountFromServer()` para obtener el total sin cargar todos los documentos

### 2. `app/pages/maps/explore/index.vue`

**Antes** (115 líneas de código):

```javascript
// Construir filtros complejos con pleg-connect
// Ordenar en cliente
// Paginar en cliente
// Filtrar búsqueda en cliente
```

**Ahora** (15 líneas de código):

```javascript
const result = await mapService.getExploreMaps({
    filters: {
        quality: data.filters.quality,
        style: data.filters.style,
        composition: data.filters.composition,
    },
    sort: data.filters.sort,
    pagination: {
        page: data.pagination.page,
        pageSize: data.pagination.pageSize,
    },
});

if (result.success) {
    data.maps = result.items || [];
    data.pagination.total = result.total || 0;
}
```

## 🔥 Índices Requeridos en Firestore

Para que las consultas funcionen, necesitas crear estos índices compuestos:

### Índice 1: Most Recent (date)

```
Collection: maps
Campos:
  - quality (Array-contains-any)
  - status (Ascending)
  - is_purchased_copy (Ascending)
  - created_at (Descending)
```

### Índice 2: Most Voted (votes)

```
Collection: maps
Campos:
  - quality (Array-contains-any)
  - status (Ascending)
  - is_purchased_copy (Ascending)
  - votes (Descending)
  - created_at (Descending)
```

**⚠️ Cambio Importante**: Ahora usamos `quality IN ['medium', 'high', 'superhigh', 'ultrahigh']` en lugar de `quality != 's'`. Esto permite ordenar directamente por fecha o votos sin tener que ordenar por quality primero.

**Cómo crear**:

1. Recarga `/maps/explore`
2. Firestore mostrará un error con un enlace
3. Haz clic en el enlace
4. Haz clic en "Create Index"
5. Espera 2-5 minutos

## 📊 Ventajas de la Nueva Implementación

| Aspecto            | Antes (pleg-connect)       | Ahora (Firestore directo)   |
| ------------------ | -------------------------- | --------------------------- |
| **Ordenamiento**   | ❌ En cliente (incorrecto) | ✅ En servidor (correcto)   |
| **Paginación**     | ❌ En cliente              | ✅ En servidor              |
| **Performance**    | ❌ Carga todos los mapas   | ✅ Solo carga página actual |
| **Escalabilidad**  | ❌ Lento con muchos mapas  | ✅ Rápido siempre           |
| **Código**         | ❌ 115 líneas              | ✅ 15 líneas                |
| **Mantenibilidad** | ❌ Complejo                | ✅ Simple                   |

## 🧪 Testing

### Verificar Ordenamiento por Votos:

1. Ve a `/maps/explore`
2. Selecciona "Most voted"
3. Verifica en consola:
    ```
    📋 Primeros 5 mapas recibidos del servidor (ya ordenados):
      1. UID: abc12345... | Votes: 10 | Created: 2025-11-17T12:00:00Z | Quality: high
      2. UID: def67890... | Votes: 8  | Created: 2025-11-17T11:00:00Z | Quality: medium
      3. UID: ghi11121... | Votes: 5  | Created: 2025-11-17T10:00:00Z | Quality: high
    ```

### Verificar Ordenamiento por Fecha:

1. Selecciona "Most recent"
2. Verifica que las fechas estén en orden descendente (más recientes primero)

### Verificar Paginación:

1. Navega entre páginas
2. Verifica que los mapas cambien correctamente
3. Verifica que el total de páginas sea correcto

## 🐛 Troubleshooting

### Error: "The query requires an index"

-   **Solución**: Crea los índices en Firestore (ver sección "Índices Requeridos")

### Los mapas no se ordenan correctamente

-   **Verifica**: Que los índices estén en estado "Enabled" (no "Building")
-   **Espera**: 2-5 minutos después de crear el índice
-   **Recarga**: La página con Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)

### Error: "getExploreMaps is not a function"

-   **Causa**: El servicio no se ha actualizado
-   **Solución**: Recarga la página completamente

## 📝 Próximas Mejoras

1. **Búsqueda de texto**: Implementar filtro de búsqueda en el servidor (requiere Algolia o similar)
2. **Caché**: Implementar caché de resultados para mejorar performance
3. **Filtros adicionales**: Agregar más filtros (tamaño, orientación, etc.)
4. **Lazy loading**: Implementar scroll infinito en lugar de paginación

## 🎯 Conclusión

La nueva implementación es:

-   ✅ Más simple (15 líneas vs 115 líneas)
-   ✅ Más rápida (solo carga página actual)
-   ✅ Más escalable (funciona con miles de mapas)
-   ✅ Más mantenible (código limpio y directo)
-   ✅ Correcta (ordenamiento del lado del servidor)
