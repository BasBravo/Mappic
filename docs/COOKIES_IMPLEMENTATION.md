# Cookie Integration Implementation Guide

## Overview
Se ha implementado una integración completa de cookies y Google Analytics con consentimiento granular del usuario.

## Archivos Creados

### 1. **Store** (`stores/cookieStore.ts`)
- Gestiona el estado de consentimiento de cookies
- Persiste preferencias en localStorage
- Métodos: `acceptAll()`, `rejectAll()`, `updatePreferences()`

### 2. **Composable** (`app/composables/useCookies.ts`)
- Hook para acceder al store de cookies
- Uso: `const { preferences, showBanner, acceptAll } = useCookies()`

### 3. **Componentes**
- **CookieBanner** (`app/components/cookies/CookieBanner.vue`)
  - Banner sticky en el footer
  - Botones: Aceptar Todo, Rechazar Todo, Personalizar
  - Se oculta después de interacción

- **CookieModal** (`app/components/cookies/CookieModal.vue`)
  - Modal con preferencias detalladas
  - Toggle individual para cada tipo de cookie
  - Descripciones claras

### 4. **Plugin** (`app/plugins/googleAnalytics.ts`)
- Inicializa Google Analytics de forma condicional
- Escucha cambios en preferencias
- Activa/desactiva gtag dinámicamente

### 5. **Tipos** (`types/cookies.d.ts`)
- Tipos TypeScript para cookies

### 6. **Traducciones**
- ✅ Inglés (`i18n/locales/en.js`)
- ✅ Español (`i18n/locales/es.js`)
- ✅ Chino (`i18n/locales/zh.js`)

## Cómo Funciona

### Flujo de Consentimiento

```
1. Usuario accede a la web
   ↓
2. ¿Cookies aceptadas en localStorage?
   ├─ NO → Mostrar CookieBanner
   │   ├─ Aceptar Todo → Guardar preferencias
   │   ├─ Rechazar Todo → Guardar preferencias (solo necessary)
   │   └─ Personalizar → Abrir CookieModal
   │
   └─ SÍ → Cargar Google Analytics si está permitido
```

### Tipos de Cookies

1. **Necessary** (Siempre activas)
   - Autenticación
   - Seguridad CSRF
   - Preferencias de idioma
   - No requieren consentimiento

2. **Analytics** (Google Analytics)
   - Tracking de usuarios
   - Comportamiento en la web
   - Requiere consentimiento explícito

3. **Marketing** (Futuro)
   - Publicidad personalizada
   - Requiere consentimiento

4. **Preferences** (Futuro)
   - Tema oscuro/claro
   - Preferencias de usuario
   - Requiere consentimiento

## Uso en Componentes

### Acceder a Preferencias
```javascript
const { preferences, isAccepted } = useCookies();

// Verificar si analytics está aceptado
if (isAccepted('analytics')) {
  // Rastrear evento
}
```

### Aceptar/Rechazar Cookies
```javascript
const { acceptAll, rejectAll, updatePreferences } = useCookies();

// Aceptar todas
acceptAll();

// Rechazar todas (excepto necessary)
rejectAll();

// Actualizar preferencias específicas
updatePreferences({
  analytics: true,
  marketing: false,
  preferences: true
});
```

### Mostrar Modal
```javascript
const { setModalVisible } = useCookies();

setModalVisible(true);
```

## Persistencia

Las preferencias se guardan en `localStorage` con la clave `mappic_cookies_consent`:

```json
{
  "necessary": true,
  "analytics": true,
  "marketing": false,
  "preferences": true,
  "timestamp": 1699600000000,
  "version": 1
}
```

## Google Analytics

### Activación Condicional
- Google Analytics se carga **solo si** el usuario acepta cookies de analytics
- El plugin escucha cambios en preferencias
- Si el usuario rechaza después, gtag se desactiva automáticamente

### Configuración
En `nuxt.config.ts`:
```typescript
gtagId: process.env.NUXT_GOOGLE_GTAG_ID
```

## Cumplimiento Legal

✅ **RGPD Compliant**
- Consentimiento explícito requerido
- Opción de rechazar sin fricción
- Posibilidad de cambiar preferencias en cualquier momento

✅ **CCPA Compliant**
- Información clara sobre cookies
- Control granular del usuario
- Transparencia en el uso de datos

## Próximos Pasos

1. **Página de Política de Cookies**
   - Crear página detallada en `/about/cookies`
   - Enlace desde el banner

2. **Integración con Segment**
   - Para marketing y retargeting

3. **Dashboard de Preferencias**
   - En la página de perfil del usuario
   - Permitir cambiar preferencias en cualquier momento

4. **Auditoría de Cumplimiento**
   - Verificar con herramientas de RGPD
   - Revisar políticas de privacidad

## Testing

### Verificar Funcionamiento

1. **Banner Visible**
   - Abrir web en navegador privado
   - Verificar que aparece el banner

2. **Aceptar Todo**
   - Hacer clic en "Aceptar Todo"
   - Verificar que se guarda en localStorage
   - Recargar página → banner no debe aparecer

3. **Rechazar Todo**
   - Limpiar localStorage
   - Hacer clic en "Rechazar Todo"
   - Verificar que solo `necessary: true`

4. **Personalizar**
   - Hacer clic en "Personalizar"
   - Cambiar preferencias
   - Guardar y verificar en localStorage

5. **Google Analytics**
   - Aceptar analytics
   - Abrir DevTools → Network
   - Verificar que gtag se carga
   - Rechazar analytics
   - Recargar → gtag no debe cargarse

## Troubleshooting

### Banner no aparece
- Verificar que `CookiesCookieBanner` está en el layout
- Limpiar localStorage: `localStorage.removeItem('mappic_cookies_consent')`
- Verificar que el store se inicializa correctamente

### Google Analytics no funciona
- Verificar que `NUXT_GOOGLE_GTAG_ID` está configurado en `.env`
- Verificar que el plugin se carga en `app/plugins/`
- Verificar que analytics está aceptado en localStorage

### Traducciones faltantes
- Verificar que las claves existen en `i18n/locales/`
- Usar `$t('cookies.banner.title')` en componentes

## Notas Importantes

- El banner es **no intrusivo** pero **visible**
- Las cookies **necessary** nunca requieren consentimiento
- Permitir **rechazar todo** sin fricción
- Textos claros y en idioma del usuario
- Cumplir con leyes de privacidad locales

## Soporte

Para preguntas o problemas, consultar:
- Plan completo: `/plans/COOKIES_INTEGRATION.md`
- Código: `stores/cookieStore.ts`, `app/plugins/googleAnalytics.ts`
