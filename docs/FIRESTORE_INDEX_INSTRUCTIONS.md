# Instrucciones para Crear Índice Compuesto en Firestore

## 📋 Contexto

Para que la página `/maps/explore` funcione correctamente con el ordenamiento múltiple (primero por votos, luego por fecha), **necesitas crear un índice compuesto en Firestore**.

## 🔍 ¿Qué es un Índice Compuesto?

Firestore requiere índices compuestos cuando:

-   Ordenas por múltiples campos
-   Combinas filtros con ordenamiento
-   Usas operadores de desigualdad (`!=`, `>`, `<`) con ordenamiento

En nuestro caso: **Ordenamos por `votes` DESC y luego por `created_at` DESC**.

## 🚀 Cómo Crear el Índice

### Opción 1: Automática (Recomendado)

1. **Abre la aplicación** en tu navegador
2. **Ve a** `/maps/explore`
3. **Selecciona "Most voted"** en el filtro de ordenamiento
4. **Abre la consola del navegador** (F12)
5. Verás un **error de Firestore** con un **enlace directo**
6. **Haz clic en el enlace** - te llevará a Firebase Console
7. **Haz clic en "Create Index"**
8. **Espera** 2-5 minutos a que se cree el índice

### Opción 2: Manual

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** → **Indexes** → **Composite**
4. Haz clic en **"Create Index"**
5. Configura el índice:

```
Collection ID: maps
Fields to index:
  - quality (Ascending)
  - status (Ascending)
  - is_purchased_copy (Ascending)
  - votes (Descending)
  - created_at (Descending)
Query scope: Collection
```

6. Haz clic en **"Create"**
7. Espera a que el estado cambie de "Building" a "Enabled"

## 📊 Índices Necesarios

### Índice Principal (Ordenar por Votos)

```
Collection: maps
Fields:
  - quality: !=
  - status: ==
  - is_purchased_copy: ==
  - votes: DESC
  - created_at: DESC
```

### Índice Secundario (Ordenar por Fecha)

```
Collection: maps
Fields:
  - quality: !=
  - status: ==
  - is_purchased_copy: ==
  - created_at: DESC
```

## ⚠️ Notas Importantes

1. **Tiempo de Creación**: Los índices pueden tardar entre 2-5 minutos en crearse
2. **Múltiples Índices**: Si usas diferentes combinaciones de filtros, necesitarás crear índices adicionales
3. **Límites**: Firebase tiene límites en el número de índices compuestos (200 por proyecto)
4. **Costo**: Los índices compuestos NO tienen costo adicional

## 🧪 Verificación

Una vez creado el índice:

1. Recarga la página `/maps/explore`
2. Selecciona "Most voted" en el ordenamiento
3. Los mapas deberían aparecer ordenados por:
    - **Primero**: Número de votos (mayor a menor)
    - **Segundo**: Fecha de creación (más reciente primero)

## 🔧 Troubleshooting

### Error: "The query requires an index"

-   **Solución**: Sigue las instrucciones de Opción 1 (Automática)
-   El error incluye un enlace directo para crear el índice

### Error: "Index creation failed"

-   **Causa**: Puede haber un conflicto con índices existentes
-   **Solución**: Elimina índices duplicados o no usados

### Los mapas no se ordenan correctamente

-   **Verifica**: Que el índice esté en estado "Enabled" (no "Building")
-   **Espera**: 2-5 minutos después de crear el índice
-   **Recarga**: La página con Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)

## 📝 Cambios Implementados

### Archivo: `app/pages/maps/explore/index.vue`

**Antes** (Ordenamiento en cliente):

```javascript
// Ordenar en cliente después de obtener todos los datos
maps.sort((a, b) => (b.votes || 0) - (a.votes || 0));
```

**Ahora** (Ordenamiento en servidor):

```javascript
// Ordenamiento múltiple: votes desc + created_at desc
if (data.filters.sort === 'votes') {
    filters.push({ key: 'votes', direction: 'desc' });
    filters.push({ key: 'created_at', direction: 'desc' });
} else {
    filters.push({ key: 'created_at', direction: 'desc' });
}
```

**Beneficios**:

-   ✅ Paginación real del lado del servidor
-   ✅ Mejor rendimiento (no carga todos los mapas)
-   ✅ Ordenamiento consistente
-   ✅ Escalable a miles de mapas

## 📚 Referencias

-   [Firestore Composite Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
-   [Query Limitations](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations)
