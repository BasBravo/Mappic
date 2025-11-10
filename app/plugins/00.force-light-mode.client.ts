export default defineNuxtPlugin(() => {
    // Forzar modo claro antes de que se inicialice @nuxt/ui
    if (process.client) {
        // Eliminar cualquier clase de modo oscuro existente
        document.documentElement.classList.remove('dark')
        
        // Forzar modo claro
        document.documentElement.classList.add('light')
        
        // Limpiar localStorage para evitar conflictos
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('nuxt-color-mode', 'light')
            localStorage.setItem('vueuse-color-scheme', 'light')
        }
        
        // Interceptar cualquier intento de cambiar a modo oscuro
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target as Element
                    if (target.classList.contains('dark')) {
                        target.classList.remove('dark')
                        target.classList.add('light')
                    }
                }
            })
        })
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        })
    }
})