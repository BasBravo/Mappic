# Sistema de Autenticación - Documentación

## Arquitectura General

El sistema de autenticación está diseñado para ser robusto, escalable y fácil de mantener. Utiliza Firebase como backend de autenticación y Pinia para gestión de estado.

```
┌─────────────────────────────────────────────────────────────┐
│                    Componentes Vue                           │
│              (usan useAuth() composable)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│            Composables (useAuth)                             │
│         Acceso centralizado a auth state                    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│          Pinia Store (authStore)                             │
│    Gestión de estado y persistencia en localStorage         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│       Services (shared/services/auth.ts)                    │
│      Comunicación con Firebase y Backend                    │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Autenticación

### 1. Inicialización de la Aplicación

```
App Start
    ↓
01.firebase.client.ts (Plugin)
    ├─ Inicializa conexión con Firebase
    └─ Se ejecuta ANTES de auth.client.ts
    ↓
02.auth.client.ts (Plugin)
    ├─ Llama a authStore.checkAuth()
    ├─ Restaura sesión desde localStorage
    └─ Hidrata el store con datos persistidos
    ↓
App Ready
```

### 2. Login

```
Usuario hace login
    ↓
Página /auth/login
    ├─ Llama a authService.login() o loginWithGoogle()
    ├─ Recibe token e información del usuario
    └─ Llama a authStore.saveUser()
    ↓
authStore.saveUser()
    ├─ Guarda datos en el store
    ├─ Persiste en localStorage
    └─ Establece isAuthenticated = true
    ↓
Redirige a home
```

### 3. Protección de Rutas

```
Usuario navega a ruta protegida
    ↓
Middleware auth.ts
    ├─ Verifica authStore.isAuthenticated
    ├─ Verifica que exista user y token
    └─ Si no está autenticado, redirige a /auth/login
    ↓
Ruta permitida o redirigida
```

### 4. Logout

```
Usuario hace logout
    ↓
authStore.logout()
    ├─ Intenta llamar a backend para invalidar sesión
    ├─ Limpia localStorage
    ├─ Limpia el store
    └─ Establece isAuthenticated = false
    ↓
Redirige a /auth/login
```

## Componentes del Sistema

### Plugins

#### `01.firebase.client.ts`
- **Propósito**: Inicializar conexión con Firebase
- **Timing**: Se ejecuta PRIMERO
- **Ejecución**: Solo en cliente

#### `02.auth.client.ts`
- **Propósito**: Restaurar sesión desde localStorage
- **Timing**: Se ejecuta DESPUÉS de Firebase
- **Ejecución**: Solo en cliente
- **Manejo de errores**: No lanza excepciones, permite que la app continúe

### Middlewares

#### `01.connection.global.ts`
- **Propósito**: Inicializar conexión con Firebase (una sola vez)
- **Ejecución**: En cada ruta, pero solo se inicializa una vez
- **Optimización**: Usa flag `isInitialized` para evitar reinicializaciones

#### `auth.ts`
- **Propósito**: Proteger rutas que requieren autenticación
- **Uso**: Agregar `definePageMeta({ middleware: 'auth' })` en páginas protegidas
- **Validación**: Verifica `isAuthenticated`, `user` y `token`

### Store (Pinia)

#### `stores/authStore.ts`

**Estado**:
```typescript
{
    user: User | null,
    auth: AuthData | null,
    isAuthenticated: boolean,
    loading: boolean
}
```

**Acciones principales**:
- `saveUser(userData)` - Guarda usuario y token
- `clear()` - Limpia toda la autenticación
- `checkAuth()` - Valida y restaura sesión desde localStorage
- `logout()` - Logout con llamada a backend

**Persistencia**:
- Automática en localStorage
- Clave: `mappic-auth-store`
- Campos persistidos: `user`, `auth`, `isAuthenticated`

### Composables

#### `useAuth()`
- **Propósito**: Acceso centralizado a datos de autenticación
- **Uso**: `const { user, isAuthenticated, isLoading, token } = useAuth()`
- **Ventajas**: 
  - Interfaz consistente
  - Fácil de testear
  - Reutilizable en cualquier componente

### Services

#### `shared/services/auth.ts`

Métodos principales:
- `login(email, password)` - Login con email/password
- `loginWithGoogle()` - Login con Google
- `loginWithGitHub()` - Login con GitHub
- `logout()` - Logout
- `resetPassword(email)` - Reset de contraseña
- `verifyToken(token)` - Verificar token con backend
- `createUser(email, name, uid)` - Crear usuario en BD

## Mejores Prácticas

### ✅ DO's

1. **Usar `useAuth()` en componentes**
   ```javascript
   const { user, isAuthenticated } = useAuth();
   ```

2. **Proteger rutas con middleware**
   ```javascript
   definePageMeta({ middleware: 'auth' });
   ```

3. **Manejar errores en login**
   ```javascript
   const result = await authService.login(email, password);
   if (!result.success) {
       error.value = result.message;
   }
   ```

4. **Usar composable en lugar de acceder directamente al store**
   ```javascript
   // ✅ CORRECTO
   const { user } = useAuth();
   
   // ❌ INCORRECTO
   const authStore = useAuthStore();
   const user = authStore.user;
   ```

### ❌ DON'Ts

1. **No llamar a `checkAuth()` en componentes**
   - Ya se ejecuta en el plugin global

2. **No acceder directamente a localStorage**
   - El store maneja la persistencia automáticamente

3. **No crear múltiples instancias de authService**
   - Usar `createAuth()` una sola vez

4. **No ignorar errores de autenticación**
   - Siempre manejar y loguear errores

## Flujo de Datos

```
┌─────────────────────────────────────────┐
│   Usuario hace login                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   authService.login()                   │
│   - Valida credenciales con Firebase    │
│   - Obtiene token e información         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   authStore.saveUser()                  │
│   - Guarda en state                     │
│   - Persiste en localStorage            │
│   - Establece isAuthenticated = true    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Componentes se actualizan             │
│   - useAuth() devuelve nuevos datos     │
│   - Vistas se renderizan                │
└─────────────────────────────────────────┘
```

## Seguridad

### Token Management
- Los tokens se guardan en localStorage (accesible a JavaScript)
- Para mayor seguridad, considerar usar HttpOnly cookies en el futuro
- El token se envía en header `Authorization: Bearer <token>`

### Session Validation
- `checkAuth()` valida que el token coincida con el almacenado
- En el futuro, agregar validación con backend

### Logout
- Llama al backend para invalidar sesión
- Limpia localStorage
- Limpia el store
- Redirige a login

## Troubleshooting

### Usuario desaparece al recargar
**Causa**: El plugin `02.auth.client.ts` no se ejecutó correctamente
**Solución**: 
1. Verificar que el plugin esté en `app/plugins/`
2. Verificar que el nombre sea `02.auth.client.ts`
3. Verificar que `authStore.checkAuth()` se ejecute sin errores

### Middleware no protege rutas
**Causa**: Middleware no está aplicado a la página
**Solución**: Agregar en la página:
```javascript
definePageMeta({ middleware: 'auth' });
```

### Token inválido después de logout
**Causa**: Token no se limpió correctamente
**Solución**: Verificar que `authStore.clear()` se ejecute en logout

## Próximas Mejoras

1. **Token Refresh**: Implementar refresh automático de tokens
2. **HttpOnly Cookies**: Mover tokens a cookies HttpOnly
3. **Backend Validation**: Validar tokens con backend en cada request
4. **Rate Limiting**: Agregar rate limiting en login
5. **2FA**: Implementar autenticación de dos factores
6. **Session Timeout**: Agregar timeout de sesión
