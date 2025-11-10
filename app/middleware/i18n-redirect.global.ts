export default defineNuxtRouteMiddleware((to) => {
    const { $i18n } = useNuxtApp();
    
    // Si la ruta ya tiene un prefijo de idioma (incluyendo rutas como /es/ o /en/ o /zh/), no hacer nada
    if (to.path.match(/^\/(en|es|zh)(\/|$)/)) {
        return;
    }
    
    // Si es la ruta raíz, dejar que i18n maneje la redirección
    if (to.path === '/') {
        return;
    }
    
    // Obtener el idioma de la cookie o usar el por defecto
    const savedLocale = useCookie('i18n_redirected').value;
    const locale = savedLocale || $i18n.defaultLocale || 'en';
    
    // Construir la nueva URL preservando los parámetros de query
    let redirectUrl = `/${locale}${to.path}`;
    
    // Agregar parámetros de query si existen
    if (to.query && Object.keys(to.query).length > 0) {
        const queryString = new URLSearchParams(to.query as Record<string, string>).toString();
        redirectUrl += `?${queryString}`;
    }
    
    // Redirigir a la URL con el prefijo de idioma y parámetros preservados
    return navigateTo(redirectUrl, { redirectCode: 301 });
});