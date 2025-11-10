# Reglas de Codificación - Arquetipo Nuxt Firebase

> **Documentación completa**: Ver `.windsurf/memory-bank/` para arquitectura detallada, stack técnico y patrones completos.

## 📋 Índice Rápido

1. [Arquitectura](#arquitectura)
2. [Patrones de Implementación](#patrones-de-implementación)
3. [Auto-import de Componentes y Composables](#auto-import-de-componentes-y-composables-en-nuxt)
4. [Flujo de Datos](#flujo-de-datos)
5. [Iconos](#iconos)
6. [Optimización de Imágenes](#optimización-de-imágenes)
7. [Herramientas y MCPs](#herramientas-y-mcps)
8. [Convenciones de Naming](#convenciones-de-naming)
9. [Testing](#testing)
10. [Comandos](#comandos)
11. [Reglas de Oro](#reglas-de-oro)

---

## 🏗️ Arquitectura

### Estructura Escalable sin Módulos

El proyecto utiliza una estructura plana y escalable:

```
app/
├── components/      # Componentes UI reutilizables
├── composables/     # Lógica de negocio (hooks)
├── pages/           # Rutas y vistas
├── layouts/         # Layouts principales
├── plugins/         # Plugins Nuxt
├── utils/           # Utilidades
└── middleware/      # Middlewares

shared/
└── services/        # Servicios compartidos (Firebase, APIs)
    ├── file.ts      # Operaciones con archivos
    ├── map.ts       # Operaciones con mapas
    └── ...          # Otros servicios

stores/              # Pinia stores (estado global)
helpers/             # Funciones auxiliares
```

**Ventaja**: Estructura clara, fácil de navegar, escalable sin complejidad de módulos.

**⚠️ IMPORTANTE - Tipos TypeScript**:

- **TODOS los tipos están centralizados en `/types/`** en la raíz del proyecto
- Importar tipos: `import type { User } from '~/types/users'`
- Estructura de `/types/`:
    ```
    types/
    ├── common.d.ts       # Tipos compartidos (FirestoreDate, etc.)
    ├── users.d.ts        # Usuarios y autenticación
    ├── files.d.ts        # Archivos
    ├── maps.d.ts         # Mapas
    ├── index.d.ts        # Exportaciones centralizadas
    ```

**⚠️ IMPORTANTE - Schemas y Validaciones Zod**:

- **TODOS los schemas Zod están centralizados en `/server/schemas/`** en la raíz del proyecto
- Importar schemas desde rutas relativas en el servidor: `import { createFileSchema } from '../../schemas/files'`
- Estructura de `/server/schemas/`:
    ```
    server/schemas/
    ├── files.ts          # Schemas de archivos
    ├── maps.ts           # Schemas de mapas
    └── ...               # Otros schemas por recurso
    ```

**Regla de Oro**: 
- ✅ Tipos TypeScript → `/types/`
- ✅ Schemas Zod → `/server/schemas/`
- ✅ Servicios compartidos → `shared/services/`

---

## Patrones de Implementación

### 1. Composables (Lógica de Negocio)

**Regla**: Composables usan otros composables. NO acceden directamente a stores o services.

```typescript
// ✅ CORRECTO
export function useProducts() {
    const { user, isAuthenticated } = useAuth(); // Otro composable
    const store = useProductsStore();

    const loadProducts = async () => {
        if (!isAuthenticated.value) return;
        await store.fetchProducts(user.value.id);
    };

    return { products: store.products, loadProducts };
}

// ❌ INCORRECTO
export function useProducts() {
    const products = await ProductService.getAll(); // ❌ No usar services directamente
}
```

### 2. Services (Comunicación Externa)

**Regla**: Services son funciones/clases puras con parámetros explícitos. NO usan composables.

```typescript
// ✅ CORRECTO
export class ProductService {
    static async getUserProducts(userId: string): Promise<Product[]> {
        const response = await fetch(`/api/products?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
    }
}

// ❌ INCORRECTO
export class ProductService {
    static async getUserProducts() {
        const { user } = useAuth(); // ❌ No usar composables
        return fetch(`/api/products?userId=${user.value.id}`);
    }
}
```

#### Servicios Compartidos - Firebase

**Regla**: Todos los servicios de Firebase están centralizados en `shared/services/`.

**Estructura Actual**:

```
shared/
└── services/
    ├── file.ts       # Operaciones con archivos (Firestore + Storage)
    ├── map.ts        # Operaciones con mapas (Firestore + Storage)
    └── ...           # Otros servicios Firebase
```

**Características de los Servicios**:

- ✅ Funciones puras con parámetros explícitos
- ✅ Normalización automática de URLs de Firebase
- ✅ Manejo centralizado de errores
- ✅ Reutilizables desde cualquier parte del proyecto

**Ejemplo - file.ts**:

```typescript
// shared/services/file.ts
import { normalizeFirebaseUrl } from './helpers';

export async function getFile(fileId: string) {
    const doc = await getDoc(doc(db, 'files', fileId));
    const data = doc.data();
    
    // Normalizar URLs de Firebase Storage
    return normalizeFileData(data);
}

export async function getFiles(userId: string) {
    const q = query(collection(db, 'files'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => normalizeFileData(doc.data()));
}
```

**Ejemplo - map.ts**:

```typescript
// shared/services/map.ts
export async function getMap(mapId: string) {
    const doc = await getDoc(doc(db, 'maps', mapId));
    const data = doc.data();
    
    // Normalizar URLs de referencias de archivos
    return normalizeMapData(data);
}

export async function getMaps(userId: string) {
    const q = query(collection(db, 'maps'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => normalizeMapData(doc.data()));
}
```

**Uso desde Composables**:

```typescript
// app/composables/useFiles.ts
import { getFiles } from '~/shared/services/file';

export function useFiles() {
    const files = ref([]);
    
    const loadFiles = async (userId: string) => {
        files.value = await getFiles(userId);
    };
    
    return { files: readonly(files), loadFiles };
}
```

**Regla de Oro**: 
- ✅ Services NO usan otros services directamente
- ✅ Services retornan datos normalizados y listos para usar
- ✅ Composables orquestan múltiples services si es necesario

### 3. Stores (Estado)

**Regla**: Stores con métodos puros. Usan services para datos externos.

```typescript
// ✅ CORRECTO
export const useProductsStore = defineStore('products', () => {
    const products = ref<Product[]>([]);

    const setProducts = (newProducts: Product[]) => {
        products.value = newProducts;
    };

    const fetchProducts = async (userId: string) => {
        const data = await ProductService.getUserProducts(userId);
        setProducts(data);
    };

    return {
        products: readonly(products),
        setProducts,
        fetchProducts
    };
});

// ❌ INCORRECTO
export const useProductsStore = defineStore('products', () => {
    const { user } = useAuth(); // ❌ No usar composables en stores
});
```

### 4. Componentes (UI)

**Regla**: Componentes usan composables. NO acceden a stores o services.
**Regla**: NO utilices typescript en components ni pages. Los archivos vue SIEMPRE serán en javascript.
**Regla**: Usa siempre clases TailwindCSS en lugar de estilos CSS.
**Regla**: Usa siempre iconos de Tabler Icons (`i-tabler-*`) en lugar de Heroicons. Ver: https://tabler.io/icons
**Regla**: Siempre que trabajes con componentes de la Librería de NuxtUi (`@nuxt/ui` los que empiezan por `<U`) usa el MCP de NuxtUi para entender bien como funcionan y se implementan.
**Regla**: Si estás creando un formulario utiliza siempre UFormField a no ser que te especifique lo contrario.
**Regla**: Si el prompt contiene una URL de Figma, utiliza el MCP de Figma para obtener información del diseño antes de implementar.

```vue
<!-- ✅ CORRECTO -->
<script setup>
const { products, loading, loadProducts } = useProducts();

onMounted(() => loadProducts());
</script>

<!-- ❌ INCORRECTO -->
<script setup lang="ts">
const store = useProductsStore(); // ❌ Usar composable
const products = await ProductService.getAll(); // ❌ Usar composable
</script>
```

### 5. Auto-import de Componentes y Composables en Nuxt

**Regla de Oro**: En Nuxt 3, los componentes y composables NO requieren importación explícita. Se pueden usar directamente respetando su ubicación.

#### Composables
Los composables se llaman directamente por su nombre sin necesidad de importar:

```javascript
// ✅ CORRECTO - Composable se usa directamente
const { user, isAuthenticated } = useAuth();
const { products, loading } = useProducts();
const { comments, fetchComments } = useComments({ entityType: 'project', entityId: '123' });

// ❌ INCORRECTO - No necesita importación
import { useAuth } from '~/app/composables/useAuth';
const { user } = useAuth();
```

#### Componentes en `/app/components`
Los componentes en la carpeta global se llaman siguiendo su ruta dentro de `app/components`:

```vue
<!-- ✅ CORRECTO - Componentes globales sin importación -->
<template>
  <div>
    <!-- Componente: app/components/Button.vue -->
    <Button label="Click me" />
    
    <!-- Componente: app/components/form/Input.vue -->
    <FormInput placeholder="Enter text" />
    
    <!-- Componente: app/components/comments/CommentSection.vue -->
    <CommentSection entity-type="project" :entity-id="projectId" />
  </div>
</template>

<!-- ❌ INCORRECTO - No necesita importación explícita -->
<script setup>
import Button from '~/app/components/Button.vue';
import FormInput from '~/app/components/form/Input.vue';
</script>
```

#### Componentes en Subdirectorios
Los componentes en subdirectorios de `app/components` se llaman con su ruta:

```vue
<!-- ✅ CORRECTO - Componentes con ruta -->
<template>
  <div>
    <!-- Componente: app/components/files/FileCard.vue -->
    <FilesFileCard :file="file" />
    
    <!-- Componente: app/components/maps/MapViewer.vue -->
    <MapsMapViewer :map="map" />
    
    <!-- Componente: app/components/common/Header.vue -->
    <CommonHeader />
  </div>
</template>

<!-- ❌ INCORRECTO - No necesita importación explícita -->
<script setup>
import FileCard from '~/app/components/files/FileCard.vue';
</script>
```

**Estructura de Naming**:
- Componente en `app/components/[folder]/[ComponentName].vue` → `<[Folder][ComponentName] />`
- Ejemplo: `app/components/files/FileCard.vue` → `<FilesFileCard />`
- Ejemplo: `app/components/maps/MapViewer.vue` → `<MapsMapViewer />`

**Beneficios**:
- ✅ Código más limpio sin imports innecesarios
- ✅ Mejor performance (Nuxt optimiza automáticamente)
- ✅ Menos errores de rutas
- ✅ Refactorización más fácil (Nuxt actualiza automáticamente)

---

## 🔄 Flujo de Datos

### Arquitectura Unidireccional

```
Components (UI)
    ↓ usa
Composables (Lógica)
    ↓ usa
Stores (Estado)
    ↓ usa
Services (API/External)
```

**Regla de Oro**: El flujo es SIEMPRE descendente. Nunca al revés.

### Comunicación entre Capas

**Reglas**:

1. ✅ Usar **composables** desde componentes
2. ✅ Usar **servicios compartidos** desde composables
3. ✅ Usar **stores** desde composables
4. ❌ NO acceder directamente a services desde componentes
5. ❌ NO acceder directamente a stores desde componentes

```typescript
// ✅ CORRECTO: Composable orquesta services y stores
export function useFiles() {
    const filesStore = useFilesStore();
    
    const loadFiles = async (userId: string) => {
        // Usar service compartido
        const files = await getFiles(userId);
        // Actualizar store
        filesStore.setFiles(files);
    };
    
    return {
        files: readonly(filesStore.files),
        loadFiles
    };
}

// ✅ CORRECTO: Componente usa composable
export default {
    setup() {
        const { files, loadFiles } = useFiles();
        
        onMounted(() => loadFiles(userId));
        
        return { files };
    }
}

// ❌ INCORRECTO: Componente accede directamente a service
export default {
    setup() {
        const files = await getFiles(userId); // ❌ Usar composable
    }
}

// ❌ INCORRECTO: Componente accede directamente a store
export default {
    setup() {
        const store = useFilesStore(); // ❌ Usar composable
    }
}
```

---

## 🎨 Traducciones

**Reglas**:

1. ❌ NO usar caracteres especiales en traducciones como: @

---

## 🎨 Iconos

### Tabler Icons

**Usa siempre Tabler Icons** para mantener consistencia visual en todo el proyecto.

```vue
<!-- ✅ CORRECTO -->
<UIcon name="i-tabler-search" />
<UButton icon="i-tabler-edit" />
<UIcon name="i-tabler-file-type-pdf" />

<!-- ❌ INCORRECTO -->
<UIcon name="i-heroicons-magnifying-glass" />
<UButton icon="i-heroicons-pencil" />
```

**Recursos**:

- Catálogo completo: https://tabler.io/icons
- Iconos comunes:
    - Archivos: `i-tabler-file`, `i-tabler-file-type-pdf`, `i-tabler-file-text`
    - Acciones: `i-tabler-edit`, `i-tabler-download`, `i-tabler-trash`
    - UI: `i-tabler-search`, `i-tabler-x`, `i-tabler-check`
    - Navegación: `i-tabler-menu-2`, `i-tabler-chevron-down`, `i-tabler-arrow-left`

---

## ⚠️ Rutas en Server

**IMPORTANTE**: Los alias `~` NO funcionan en archivos de `/server/`.

**Solución**: Usar rutas relativas desde la ubicación del archivo:

```typescript
// ❌ INCORRECTO - Alias no funcionan en server
import { createCommentSchema } from '~/types/comments.schema';

// ✅ CORRECTO - Usar rutas relativas
// Desde /server/api/comments/index.post.ts
import { createCommentSchema } from '../../../types/comments.schema';

// Desde /server/api/comments/[id]/report.post.ts
import { reportSchema } from '../../../../types/comments.schema';
```

**Regla**: Contar los niveles de profundidad y usar `../` para subir directorios.

---

## 🖼️ Optimización de Imágenes

### @nuxt/image

**Usa siempre `<NuxtImg>` o `<NuxtPicture>`** para optimización automática de imágenes.

```vue
<!-- ✅ CORRECTO: Imagen optimizada -->
<NuxtImg :src="file.url" :alt="file.name" class="w-full h-auto rounded-lg" loading="lazy" quality="85" />

<!-- ✅ CORRECTO: Con dimensiones específicas -->
<NuxtImg src="/hero.jpg" width="1200" height="600" alt="Hero image" loading="eager" />

<!-- ❌ INCORRECTO: Imagen sin optimizar -->
<img :src="file.url" :alt="file.name" />
```

### Reglas de Uso

1. **Siempre usar `alt`**: Obligatorio para accesibilidad y SEO
2. **Lazy loading por defecto**: Solo usar `loading="eager"` para imágenes above-the-fold
3. **Especificar dimensiones**: Evita layout shift cuando sea posible
4. **Quality**: 80-85 para balance entre calidad y tamaño
5. **Clases Tailwind**: Para estilos responsive y adaptativos

### Casos de Uso

```vue
<!-- Preview de archivo en modal -->
<NuxtImg v-if="isImage" :src="file.url" :alt="file.name" class="w-full h-auto rounded-lg" loading="lazy" quality="85" />

<!-- Thumbnail en grid -->
<NuxtImg :src="file.url" :alt="file.name" class="w-8 h-8 object-cover rounded" loading="lazy" />

<!-- Hero image -->
<NuxtImg src="/hero.jpg" width="1920" height="1080" alt="Hero" loading="eager" class="w-full h-auto" />
```

**Beneficios**:

- ✅ Conversión automática a WebP
- ✅ Lazy loading nativo
- ✅ Responsive images
- ✅ Mejor performance y Core Web Vitals

---

## 🛠️ Herramientas y MCPs

### Model Context Protocol (MCP)

El proyecto utiliza varios MCPs para mejorar la productividad y calidad del código.

#### MCP de NuxtUI

**Cuándo usar**: Al trabajar con componentes de `@nuxt/ui` (componentes que empiezan con `<U`).

```vue
<!-- Antes de implementar, consulta el MCP de NuxtUI -->
<UButton>Click me</UButton>
<UFormField label="Email" name="email">
    <UInput v-model="email" type="email" />
</UFormField>
```

**Beneficios**:

- ✅ Conocer todas las props disponibles
- ✅ Entender variantes y configuraciones
- ✅ Implementación correcta desde el inicio

#### MCP de Figma

**Regla**: Si el prompt contiene una URL de Figma, SIEMPRE usa el MCP de Figma antes de implementar.

**Proceso**:

1. Detectar URL de Figma en el prompt
2. Usar MCP de Figma para obtener información del diseño
3. Extraer colores, tipografías, espaciados, componentes
4. Implementar basándose en la información obtenida

**Ejemplo de URL de Figma**:

```
https://www.figma.com/file/ABC123/Design-System
https://www.figma.com/design/XYZ789/Project-Name
```

**Beneficios**:

- ✅ Implementación fiel al diseño
- ✅ Tokens de diseño correctos (colores, espaciados)
- ✅ Menos iteraciones y correcciones
- ✅ Consistencia visual

#### MCP de Motion

**Regla**: Si se solicita crear animaciones, SIEMPRE usa el MCP de Motion.

**Cuándo usar**:

- Animaciones CSS con easing functions
- Animaciones de spring (rebote)
- Animaciones de bounce
- Transiciones suaves y naturales

**Proceso**:

1. Identificar el tipo de animación solicitada
2. Usar el MCP de Motion para generar el código CSS optimizado
3. Aplicar las animaciones generadas en los componentes

**Beneficios**:

- ✅ Animaciones fluidas y naturales
- ✅ Código CSS optimizado con `linear()` easing
- ✅ Control preciso de duración y bounce
- ✅ Mejor experiencia de usuario

**Ejemplo**:

```css
/* Animación generada por Motion MCP */
.bounce-animation {
    animation: bounce 1s ease-out;
}
```

#### Tabler Icons

**Regla**: Usar siempre Tabler Icons para iconografía.

- Catálogo: https://tabler.io/icons
- Formato: `i-tabler-[nombre-icono]`

```vue
<UIcon name="i-tabler-search" />
<UButton icon="i-tabler-edit" />
```

---

## 📝 Convenciones de Naming

### Archivos

| Tipo        | Convención                     | Ejemplo                            |
| ----------- | ------------------------------ | ---------------------------------- |
| Componentes | PascalCase                     | `LoginForm.vue`                    |
| Composables | camelCase + `use`              | `useAuth.ts`                       |
| Stores      | camelCase + `Store`            | `authStore.ts`                     |
| Services    | camelCase + `Service`          | `authService.ts`                   |
| Types       | camelCase                      | `auth.ts`                          |
| Schemas     | camelCase + `Schema`           | `loginSchema.ts`                   |
| Tests Unit  | `[tipo].[nombre].test.ts`      | `service.auth.test.ts`             |
| Tests Nuxt  | `[tipo].[nombre].nuxt.test.ts` | `component.LoginForm.nuxt.test.ts` |
| Pages       | kebab-case                     | `reset-password.vue`               |

### Código

```typescript
// Variables/funciones: camelCase
const userName = 'John';
const getUserData = () => {};

// Tipos/Interfaces: PascalCase
interface User {}
type Product = {};

// Constantes: UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com';
const MAX_RETRIES = 3;
```

---

## 🧪 Testing

### Dos Configuraciones

```bash
# Tests unitarios (rápidos) - services, stores, composables
npm run test:unit

# Tests de componentes (con Nuxt environment)
npm run test:nuxt

# Todos los tests
npm run test
```

### Patrón de Test de Service

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ProductService } from '../services/productService';

describe('ProductService', () => {
    it('should fetch products', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ id: '1', name: 'Product 1' }]
        });

        const products = await ProductService.getUserProducts('user123');

        expect(products).toHaveLength(1);
        expect(fetch).toHaveBeenCalledWith('/api/products?userId=user123');
    });
});
```

### Patrón de Test de Store

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useProductsStore } from '../stores/productsStore';

describe('ProductsStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should set products', () => {
        const store = useProductsStore();
        const products = [{ id: '1', name: 'Product 1' }];

        store.setProducts(products);

        expect(store.products).toEqual(products);
    });
});
```

### Patrón de Test de Componente

```typescript
import { mountSuspended } from '@nuxt/test-utils/runtime';
import ProductList from '../components/ProductList.vue';

describe('ProductList', () => {
    it('should render products', async () => {
        const wrapper = await mountSuspended(ProductList, {
            props: {
                products: [{ id: '1', name: 'Product 1' }]
            }
        });

        expect(wrapper.text()).toContain('Product 1');
    });
});
```

---

## 🛠️ Comandos

### Desarrollo

```bash
npm run dev              # Desarrollo (.env.dev)
npm run prod             # Desarrollo (.env.prod)
```

### Build

```bash
npm run build:dev        # Build desarrollo
npm run build:prod       # Build producción
```

### Testing

```bash
npm run test             # Todos los tests
npm run test:unit        # Solo unitarios
npm run test:nuxt        # Solo componentes
```

### Calidad

```bash
npm run lint             # Verificar linting
npm run lint:fix         # Autofix linting
npm run format           # Formatear código
npm run typecheck        # Verificar tipos
npm run validate         # Todo (pre-push)
```

### Deploy

```bash
npm run deploy:dev       # Deploy a desarrollo
npm run deploy:prod      # Deploy a producción
```

---

## ⚡ Reglas de Oro

### ✅ DO's

#### Arquitectura

- ✅ Mantener módulos independientes
- ✅ Usar composables para lógica de negocio
- ✅ Stores simples (solo estado y mutaciones)
- ✅ Services puros sin dependencias del framework
- ✅ Componentes enfocados en presentación
- ✅ Servicios compartidos en `shared/services/` para funcionalidad reutilizable

#### Código

- ✅ TypeScript estricto (no usar `any`)
- ✅ Validar datos con Zod
- ✅ Documentar funciones públicas con JSDoc
- ✅ Manejar errores apropiadamente
- ✅ Usar `async/await` en lugar de promises
- ✅ Usar `computed` para valores derivados
- ✅ Usar `readonly()` para exponer estado inmutable

#### Herramientas y MCPs

- ✅ Usar MCP de NuxtUI para componentes `@nuxt/ui`
- ✅ Usar MCP de Figma cuando el prompt contenga URLs de Figma
- ✅ Usar MCP de Motion cuando se soliciten animaciones
- ✅ Usar Tabler Icons (`i-tabler-*`) para iconografía

#### Testing

- ✅ Tests unitarios para lógica pura
- ✅ Tests de componentes para UI crítica
- ✅ Mockear dependencias externas
- ✅ Tests descriptivos y legibles

#### Git

- ✅ Commits pequeños y frecuentes
- ✅ Mensajes descriptivos (Conventional Commits)
- ✅ Branches por feature
- ✅ Pull requests con descripción clara

### ❌ DON'Ts

#### Arquitectura

- ❌ NO acceder a stores desde componentes (usar composables)
- ❌ NO usar composables en services
- ❌ NO usar composables en stores
- ❌ NO hacer lógica de negocio en componentes
- ❌ NO hacer lógica de negocio en stores
- ❌ NO acceder a stores de otros módulos directamente
- ❌ NO acceder a services de otros módulos directamente (usar composables o `shared/services/`)
- ❌ NO hacer que services usen otros services directamente

#### Código

- ❌ NO usar `any` en TypeScript
- ❌ NO ignorar errores de TypeScript
- ❌ NO hardcodear valores (usar constantes/env)
- ❌ NO dejar `console.log` en producción
- ❌ NO usar `var` (usar `const`/`let`)
- ❌ NO mutar props directamente

#### Testing

- ❌ NO skipear tests
- ❌ NO tests que dependan de orden
- ❌ NO tests sin assertions
- ❌ NO commitear tests rotos

#### Git

- ❌ NO commits gigantes
- ❌ NO usar `--no-verify` sin razón válida
- ❌ NO commitear `.env` o `node_modules`
- ❌ NO push directo a main/develop

---

## 📚 Recursos Adicionales

### Documentación Completa

- **Memory Bank**: `.windsurf/memory-bank/` - Arquitectura, stack, patrones detallados
- **README**: `README.md` - Setup, instalación, comandos
- **Docs de Módulos**: `app/modules/*/docs/` - Documentación específica

### Stack Principal

- **Nuxt 4** - Framework Vue.js full-stack
- **Vue 3** - Composition API + Script Setup
- **TypeScript 5** - Tipado estático
- **Firebase** - Backend serverless
- **TailwindCSS + Nuxt UI** - Styling y componentes
- **Pinia** - Store de estado
- **Vitest** - Testing framework
- **Zod** - Schema validation

### Git Hooks

- **Pre-commit**: lint-staged (Prettier + ESLint en archivos modificados)
- **Pre-push**: `npm run validate` (format + lint + typecheck + test:unit)

### Convenciones de Commits

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, punto y coma
refactor: refactorización
test: agregar/modificar tests
chore: tareas de mantenimiento
```

---

## 🎯 Ejemplo Rápido: Integrar Feature "Tasks" con Firebase

### 1. Crear estructura

```bash
# Tipos
touch types/tasks.d.ts

# Service Firebase
touch shared/services/task.ts

# Store
touch stores/taskStore.ts

# Composable
touch app/composables/useTasks.ts

# Componentes
mkdir -p app/components/tasks
touch app/components/tasks/TaskList.vue

# Tests
touch app/composables/__tests__/useTasks.test.ts
```

### 2. Type

```typescript
// types/tasks.d.ts
export interface Task {
    id: string;
    title: string;
    completed: boolean;
    userId: string;
    createdAt: FirestoreDate;
}
```

### 3. Service Firebase

```typescript
// shared/services/task.ts
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '~/app/plugins/firebase';

export async function getTasks(userId: string): Promise<Task[]> {
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Task[];
}

export async function getTask(taskId: string): Promise<Task | null> {
    const doc = await getDoc(doc(db, 'tasks', taskId));
    return doc.exists() ? { id: doc.id, ...doc.data() } as Task : null;
}
```

### 4. Store

```typescript
// stores/taskStore.ts
import { defineStore } from 'pinia';

export const useTaskStore = defineStore('tasks', () => {
    const tasks = ref<Task[]>([]);

    const setTasks = (newTasks: Task[]) => {
        tasks.value = newTasks;
    };

    return { 
        tasks: readonly(tasks), 
        setTasks 
    };
});
```

### 5. Composable

```typescript
// app/composables/useTasks.ts
import { getTasks } from '~/shared/services/task';

export function useTasks() {
    const { user, isAuthenticated } = useAuth();
    const taskStore = useTaskStore();
    const loading = ref(false);
    const error = ref<string | null>(null);

    const loadTasks = async () => {
        if (!isAuthenticated.value || !user.value) return;
        
        loading.value = true;
        error.value = null;
        
        try {
            const data = await getTasks(user.value.id);
            taskStore.setTasks(data);
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Error loading tasks';
        } finally {
            loading.value = false;
        }
    };

    return {
        tasks: readonly(taskStore.tasks),
        loading: readonly(loading),
        error: readonly(error),
        loadTasks
    };
}
```

### 6. Component

```vue
<!-- app/components/tasks/TaskList.vue -->
<script setup>
const { tasks, loading, error, loadTasks } = useTasks();

onMounted(() => loadTasks());
</script>

<template>
    <div class="space-y-4">
        <div v-if="loading" class="text-center text-gray-500">
            Cargando tareas...
        </div>
        
        <div v-else-if="error" class="text-red-500">
            {{ error }}
        </div>
        
        <div v-else class="space-y-2">
            <div v-for="task in tasks" :key="task.id" class="p-4 border rounded">
                {{ task.title }}
            </div>
        </div>
    </div>
</template>
```

### 7. Test

```typescript
// app/composables/__tests__/useTasks.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../useTasks';
import * as taskService from '~/shared/services/task';

vi.mock('~/shared/services/task');

describe('useTasks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load tasks', async () => {
        const mockTasks = [{ id: '1', title: 'Task 1', completed: false }];
        vi.spyOn(taskService, 'getTasks').mockResolvedValue(mockTasks);

        const { tasks, loadTasks } = useTasks();
        await loadTasks();

        expect(tasks.value).toEqual(mockTasks);
    });
});
```

### 8. Usar en página

```vue
<!-- app/pages/tasks.vue -->
<script setup>
const { tasks, loading } = useTasks();
</script>

<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Mis Tareas</h1>
        <TasksList />
    </div>
</template>
```

---

## 📞 Soporte

- **Issues**: Reportar bugs o solicitar features
- **Documentación**: Ver `.windsurf/memory-bank/` para detalles completos
- **Ejemplos**: Ver composables en `app/composables/` y servicios en `shared/services/`
- **Firebase**: Consultar servicios en `shared/services/file.ts` y `shared/services/map.ts`

---

**Última actualización**: Noviembre 2025
**Versión**: 2.0.0 (Sin módulos, con Firebase Services)
