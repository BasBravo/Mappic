# Plan: Integración de Cookies y Google Analytics

## 📋 Descripción General
Crear una integración nativa de cookies y Google Analytics con un aviso de consentimiento completo que permita a los usuarios controlar qué cookies aceptan.

---

## 🎯 Objetivos
- ✅ Mostrar aviso de cookies al primer acceso
- ✅ Permitir aceptar/rechazar cookies de forma granular
- ✅ Integrar Google Analytics de forma condicional
- ✅ Persistir preferencias del usuario
- ✅ Cumplir con RGPD/CCPA
- ✅ Soporte multiidioma

---

## 📦 Componentes a Crear

### 1. **Store de Cookies** (`stores/cookieStore.ts`)
- Estado de consentimiento (aceptadas, rechazadas, pendientes)
- Tipos de cookies: analytics, marketing, preferences, necessary
- Métodos para aceptar/rechazar
- Persistencia en localStorage

### 2. **Composable** (`app/composables/useCookies.ts`)
- Hook para gestionar cookies
- Métodos: `acceptAll()`, `rejectAll()`, `updatePreferences()`
- Getter para estado actual

### 3. **Componente Banner** (`app/components/cookies/CookieBanner.vue`)
- Banner sticky en la parte inferior
- Botones: Aceptar Todo, Rechazar Todo, Personalizar
- Diseño responsive con Tailwind
- Animación de entrada

### 4. **Componente Modal** (`app/components/cookies/CookieModal.vue`)
- Modal con detalles de cada tipo de cookie
- Toggle individual para cada categoría
- Descripciones claras
- Botones: Guardar Preferencias, Aceptar Todo, Rechazar Todo

### 5. **Plugin de Google Analytics** (`app/plugins/googleAnalytics.ts`)
- Inicializar gtag solo si se aceptan analytics
- Escuchar cambios en preferencias
- Activar/desactivar dinámicamente

### 6. **Traducciones** (actualizar `i18n/locales/`)
- Textos del banner
- Descripciones de cookies
- Botones y modales

---

## 🏗️ Estructura de Archivos

```
app/
├── components/
│   └── cookies/
│       ├── CookieBanner.vue      # Banner principal
│       └── CookieModal.vue       # Modal de personalización
├── composables/
│   └── useCookies.ts             # Hook de cookies
└── plugins/
    └── googleAnalytics.ts        # Plugin de gtag

stores/
└── cookieStore.ts                # Store de Pinia

i18n/locales/
├── en.js                         # Traducciones EN
├── es.js                         # Traducciones ES
└── zh.js                         # Traducciones ZH
```

---

## 🔄 Flujo de Datos

```
Usuario accede a web
    ↓
¿Cookies aceptadas? (localStorage)
    ├─ NO → Mostrar CookieBanner
    │   ├─ Aceptar Todo → cookieStore.acceptAll()
    │   ├─ Rechazar Todo → cookieStore.rejectAll()
    │   └─ Personalizar → Mostrar CookieModal
    │       └─ Guardar → cookieStore.updatePreferences()
    │
    └─ SÍ → Cargar Google Analytics si está permitido

cookieStore actualiza estado
    ↓
Plugin de Google Analytics escucha cambios
    ↓
Activar/desactivar gtag según preferencias
```

---

## 📝 Tipos de Cookies a Gestionar

### 1. **Necessary** (Siempre activas)
- Autenticación
- Preferencias de idioma
- Seguridad CSRF
- No requieren consentimiento

### 2. **Analytics** (Google Analytics)
- Tracking de usuarios
- Comportamiento en la web
- Requiere consentimiento explícito

### 3. **Marketing** (Futuro)
- Publicidad personalizada
- Retargeting
- Requiere consentimiento

### 4. **Preferences** (Futuro)
- Tema oscuro/claro
- Preferencias de usuario
- Requiere consentimiento

---

## 🛠️ Implementación Paso a Paso

### Fase 1: Store y Composable
1. Crear `stores/cookieStore.ts` con estado base
2. Crear `app/composables/useCookies.ts`
3. Definir tipos en `types/cookies.d.ts`

### Fase 2: Componentes UI
1. Crear `CookieBanner.vue` (banner simple)
2. Crear `CookieModal.vue` (modal detallado)
3. Integrar en `app/layouts/default.vue`

### Fase 3: Google Analytics
1. Crear plugin `googleAnalytics.ts`
2. Registrar en `nuxt.config.ts`
3. Escuchar cambios de preferencias

### Fase 4: Traducciones
1. Agregar claves en `i18n/locales/en.js`
2. Agregar claves en `i18n/locales/es.js`
3. Agregar claves en `i18n/locales/zh.js`

### Fase 5: Testing
1. Verificar persistencia en localStorage
2. Verificar activación/desactivación de gtag
3. Verificar multiidioma

---

## 📋 Checklist de Funcionalidades

### Banner
- [ ] Mostrar solo una vez (localStorage)
- [ ] Botón "Aceptar Todo"
- [ ] Botón "Rechazar Todo"
- [ ] Botón "Personalizar"
- [ ] Cerrable con X
- [ ] Sticky en footer
- [ ] Responsive

### Modal
- [ ] Listar tipos de cookies
- [ ] Toggle individual para cada tipo
- [ ] Descripción clara de cada tipo
- [ ] Botón "Guardar Preferencias"
- [ ] Botón "Aceptar Todo"
- [ ] Botón "Rechazar Todo"
- [ ] Cerrable con ESC o X

### Google Analytics
- [ ] Cargar gtag solo si se acepta analytics
- [ ] Desactivar si se rechaza
- [ ] Reactivar si se acepta después
- [ ] Tracking de pageviews automático

### Persistencia
- [ ] Guardar en localStorage
- [ ] Recuperar al recargar
- [ ] Expiración (opcional: 1 año)

---

## 🎨 Diseño del Banner (Tailwind)

```
┌─────────────────────────────────────────────┐
│ 🍪 We use cookies to enhance your experience │
│                                              │
│ [Reject All]  [Customize]  [Accept All]    │
└─────────────────────────────────────────────┘
```

---

## 🎨 Diseño del Modal (Tailwind)

```
┌──────────────────────────────────────┐
│ Cookie Preferences              [X]  │
├──────────────────────────────────────┤
│                                      │
│ ☑ Necessary (Always On)             │
│   Essential for security and auth   │
│                                      │
│ ☐ Analytics                         │
│   Help us understand usage          │
│                                      │
│ ☐ Marketing                         │
│   Personalized ads                  │
│                                      │
│ ☐ Preferences                       │
│   Remember your choices             │
│                                      │
├──────────────────────────────────────┤
│ [Reject All] [Save] [Accept All]   │
└──────────────────────────────────────┘
```

---

## 🌍 Traducciones Requeridas

### Claves i18n
```javascript
cookies: {
  banner: {
    title: "We use cookies",
    description: "We use cookies to enhance...",
    acceptAll: "Accept All",
    rejectAll: "Reject All",
    customize: "Customize"
  },
  modal: {
    title: "Cookie Preferences",
    necessary: "Necessary",
    analytics: "Analytics",
    marketing: "Marketing",
    preferences: "Preferences",
    descriptions: {
      necessary: "Essential for security...",
      analytics: "Help us understand...",
      marketing: "Personalized ads...",
      preferences: "Remember your choices..."
    }
  }
}
```

---

## ⚙️ Configuración en nuxt.config.ts

```typescript
// Ya existe:
gtagId: process.env.NUXT_GOOGLE_GTAG_ID

// Agregar (opcional):
runtimeConfig.public.cookies = {
  expirationDays: 365,
  storageKey: 'mappic_cookies_consent'
}
```

---

## 🔐 Consideraciones de Seguridad

- ✅ No rastrear hasta obtener consentimiento
- ✅ Almacenar preferencias en localStorage (no cookies)
- ✅ Permitir cambiar preferencias en cualquier momento
- ✅ Respetar Do Not Track (DNT)
- ✅ Cumplir RGPD/CCPA

---

## 📊 Métricas a Rastrear (después de consentimiento)

- Tasa de aceptación de cookies
- Tasa de rechazo
- Tasa de personalización
- Tipos de cookies más aceptadas

---

## 🚀 Próximos Pasos (Futuro)

- [ ] Integración con Segment para marketing
- [ ] Integración con Hotjar (heatmaps)
- [ ] Dashboard de preferencias en cuenta de usuario
- [ ] Auditoría de cumplimiento RGPD
- [ ] A/B testing de textos del banner

---

## 📝 Notas

- El banner debe ser **no intrusivo** pero **visible**
- Las cookies **necessary** nunca requieren consentimiento
- Permitir **rechazar todo** sin fricción
- Textos claros y en idioma del usuario
- Cumplir con leyes de privacidad locales

