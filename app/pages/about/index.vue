<script setup>
//
// IMPORTS
//
import { useI18n } from 'vue-i18n';
import { capitalize } from '~~/app/utils';
import { aboutPages } from '~~/data/nav';
import { mapGenerationCosts, creditPurchasePacks } from '~~/data/credits';
//
// VARS
//
const { t, locale } = useI18n();
//
// INIT
//
const myPages = aboutPages.map(page => ({
    ...page,
    to: `/${locale?.value || 'en'}${page.to}`,
    label: capitalize(t(page.label)),
    active: page.to === '/about',
}));

// Helper function to get text with fallback to English
const getLocalizedText = (enText, esText = '', zhText = '') => {
    // Safety check for locale
    const currentLocale = locale?.value || 'en';

    if (currentLocale === 'zh' && zhText) return zhText;
    if (currentLocale === 'es' && esText) return esText;
    if (currentLocale === 'en' && enText) return enText;
    // Fallback to English if no translation available
    return enText || '';
};
//
// SEO
//
if (locale?.value == 'es') {
    useSeoMeta({
        title: 'Sobre Mappic - Generador de Mapas Personalizados',
        ogTitle: 'Sobre Mappic - Crea Mapas Minimalistas de Cualquier Ciudad',
        description:
            'Descubre Mappic, la plataforma líder para generar mapas personalizados y minimalistas de cualquier ciudad del mundo. Crea mapas únicos en minutos con diseños profesionales listos para imprimir.',
        ogDescription:
            'Crea mapas personalizados y minimalistas de cualquier ciudad del mundo con Mappic. Diseños únicos, alta calidad, listos para imprimir. Prueba gratis.',
        ogImage: '/og-image.png',
        ogUrl: 'https://mappic.app/es/about',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Mappic - Crea Mapas Personalizados de Cualquier Ciudad',
        twitterDescription: 'Genera mapas minimalistas únicos en minutos. Diseños profesionales listos para imprimir.',
        twitterImage: '/og-image.png',
        keywords:
            'mapas personalizados, mapas minimalistas, generador de mapas, mapas para imprimir, cartografía personalizada, mapas de ciudades, diseño de mapas',
        author: 'Bas Bravo',
        robots: 'index, follow',
        canonical: 'https://mappic.app/es/about',
    });
}
if (locale?.value == 'en') {
    useSeoMeta({
        title: 'About Mappic - Custom Map Generator Platform',
        ogTitle: 'About Mappic - Create Minimalist Maps of Any City',
        description:
            'Discover Mappic, the leading platform to generate custom and minimalist maps of any city worldwide. Create unique maps in minutes with professional designs ready to print.',
        ogDescription:
            'Create custom minimalist maps of any city worldwide with Mappic. Unique designs, high quality, print-ready. Try free.',
        ogImage: '/og-image.png',
        ogUrl: 'https://mappic.app/en/about',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Mappic - Create Custom Maps of Any City',
        twitterDescription: 'Generate unique minimalist maps in minutes. Professional designs ready to print.',
        twitterImage: '/og-image.png',
        keywords: 'custom maps, minimalist maps, map generator, printable maps, custom cartography, city maps, map design, poster maps',
        author: 'Bas Bravo',
        robots: 'index, follow',
        canonical: 'https://mappic.app/en/about',
    });
}
if (locale?.value == 'zh') {
    useSeoMeta({
        title: '关于Mappic - 自定义地图生成平台',
        ogTitle: '关于Mappic - 创建任意城市的极简地图',
        description: '发现Mappic，这是生成世界各地任意城市自定义极简地图的领先平台。在几分钟内创建独特的地图，具有专业设计，可供打印。',
        ogDescription: '使用Mappic创建世界各地任意城市的自定义极简地图。独特设计，高质量，可打印。免费试用。',
        ogImage: '/og-image.png',
        ogUrl: 'https://mappic.app/zh/about',
        twitterCard: 'summary_large_image',
        twitterTitle: 'Mappic - 创建任意城市的自定义地图',
        twitterDescription: '在几分钟内生成独特的极简地图。专业设计，可供打印。',
        twitterImage: '/og-image.png',
        keywords: '自定义地图, 极简地图, 地图生成器, 可打印地图, 自定义制图, 城市地图, 地图设计, 海报地图',
        author: 'Bas Bravo',
        robots: 'index, follow',
        canonical: 'https://mappic.app/zh/about',
    });
}
</script>

<template>
    <div class="w-full text-black">
        <NavAbout />

        <!-- Espacio inicial -->
        <div class="h-24 md:h-46" />

        <section>
            <div class="grid max-w-screen-xl mx-auto gap-12 py-4 lg:py-16 md:px-0 grid-cols-1 lg:grid-cols-12">
                <!-- Imagen: mobile arriba, desktop derecha -->
                <div class="mb-8 md:mb-0 lg:order-2 lg:col-span-5 flex justify-center">
                    <img
                        src="/images/about-1.webp"
                        class="w-full max-w-md md:max-w-none"
                        :alt="
                            getLocalizedText('Map of the city of Tokyo in Japan', 'Mapa de la ciudad de Tokio en Japón', '日本东京城市地图')
                        " />
                </div>
                <!-- Titular: mobile abajo, desktop izquierda -->
                <div class="mr-auto place-self-center lg:order-1 lg:col-span-7 text-left">
                    <h1 class="text-5xl md:text-7xl font-semibold tracking-tight text-balance text-gray-900">
                        {{
                            getLocalizedText(
                                'Create custom maps of your favorite cities',
                                'Crea mapas personalizados de tus ciudades favoritas',
                                '创建您最喜爱城市的自定义地图'
                            )
                        }}
                    </h1>
                    <p class="max-w-2xl mx-auto md:mx-0 my-6 md:my-8 text-lg md:text-xl text-left">
                        {{
                            getLocalizedText(
                                'Mappic is an online platform that allows you to create custom maps of any city in the world in a few minutes.',
                                'Mappic es una plataforma en línea que te permite crear mapas personalizados de cualquier ciudad del mundo en pocos minutos.',
                                'Mappic是一个在线平台，让您能够在几分钟内创建世界任意城市的自定义地图。'
                            )
                        }}
                    </p>
                </div>
            </div>
        </section>

        <section>
            <div class="mx-auto max-w-screen-xl py-16 px-4 md:px-0">
                <div class="max-w-screen-md mb-16 text-center md:text-left">
                    <h2 class="mb-4 text-3xl md:text-4xl tracking-tight font-extrabold">
                        {{ getLocalizedText('How Our Platform Works', 'Cómo Funciona Nuestra Plataforma', '我们的平台如何运作') }}
                    </h2>
                    <p class="text-lg md:text-xl">
                        {{
                            getLocalizedText(
                                'Discover our online tool to generate custom maps of any city in the world. In a few minutes you will have the file ready to download and print.',
                                'Descubre nuestra herramienta en línea para generar mapas personalizados de cualquier ciudad del mundo. En pocos minutos tendrás el archivo listo para descargar e imprimir.',
                                '发现我们的在线工具，生成世界任意城市的自定义地图。几分钟内您就能获得可下载和打印的文件。'
                            )
                        }}
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-20 space-y-0">
                    <!-- 1/CITY -->
                    <div>
                        <div class="w-full flex justify-center mb-4 relative">
                            <div class="absolute bottom-0 w-full h-1/6 bg-gradient-to-b from-transparent to-background"></div>
                            <img src="/images/about-2.webp" class="border border-gray-200" />
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center -mt-2">1</span>
                            <h3 class="mb-2 text-lg md:text-xl font-bold">
                                {{ getLocalizedText('Choose Your City', 'Elige tu ciudad', '选择您的城市') }}
                            </h3>
                        </div>
                        <p class=" ">
                            {{
                                getLocalizedText(
                                    'Our tool allows you to search for any city in the world. Just enter the name of the city or special place and select the map style you like best.',
                                    'Nuestra herramienta te permite buscar cualquier ciudad del mundo. Solo ingresa el nombre de la ciudad o lugar especial y selecciona el estilo de mapa que más te guste.',
                                    '我们的工具允许您搜索世界任意城市。只需输入城市或特殊地点的名称，并选择您最喜欢的地图样式。'
                                )
                            }}
                        </p>
                    </div>

                    <!-- 2/FRAME -->
                    <div>
                        <div class="w-full flex justify-center mb-4 relative">
                            <div class="absolute bottom-0 w-full h-1/6 bg-gradient-to-b from-transparent to-background"></div>
                            <img src="/images/preview-frame.webp" class="border border-gray-200" />
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center -mt-2">2</span>
                            <h3 class="mb-2 text-lg md:text-xl font-bold">
                                {{ getLocalizedText('Adjust the Frame', 'Ajusta el encuadre', '调整框架') }}
                            </h3>
                        </div>
                        <p class=" ">
                            {{
                                locale.value == 'en'
                                    ? 'Adjust the frame and modify the zoom level to focus on the most prominent and interesting areas of the city or those that have special meaning for you.'
                                    : ''
                            }}
                            {{
                                locale.value == 'es'
                                    ? 'Ajusta el encuadre y modifica el nivel de zoom para centrar la atención en las zonas más destacadas e interesantes de la ciudad o las que tienen un significado especial para ti.'
                                    : ''
                            }}
                        </p>
                    </div>

                    <!-- 3/DESIGN -->
                    <div>
                        <div class="w-full flex justify-center mb-4 relative">
                            <div class="absolute bottom-0 w-full h-1/6 bg-gradient-to-b from-transparent to-background"></div>
                            <img src="/images/estilos-diseño-mapa.webp" class="border border-gray-200" />
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center -mt-2">3</span>
                            <h3 class="mb-2 text-lg md:text-xl font-bold">
                                {{ getLocalizedText('Customize the Design', 'Personaliza el diseño', '自定义设计') }}
                            </h3>
                        </div>
                        <p class=" ">
                            {{
                                locale.value == 'en'
                                    ? 'Customize the design of your map by selecting colors, styles, and sizes. You can choose from different map styles and colors to create a unique and personalized design.'
                                    : ''
                            }}
                            {{
                                locale.value == 'es'
                                    ? 'Personaliza el diseño de tu mapa seleccionando colores, estilos y tamaños. Puedes elegir entre diferentes estilos de mapa y colores para crear un diseño único y personalizado.'
                                    : ''
                            }}
                        </p>
                    </div>

                    <!-- 4/PREVIEW -->
                    <div>
                        <div class="w-full flex justify-center mb-4 relative">
                            <div class="absolute bottom-0 w-full h-1/6 bg-gradient-to-b from-transparent to-background"></div>
                            <img src="/images/personalizar-composicion.webp" class="border border-gray-200" />
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center -mt-2">4</span>
                            <h3 class="mb-2 text-lg md:text-xl font-bold">
                                {{ locale.value == 'en' ? 'Customize the Composition' : '' }}
                                {{ locale.value == 'es' ? 'Personaliza la composición' : '' }}
                            </h3>
                        </div>
                        <p class=" ">
                            {{
                                locale.value == 'en'
                                    ? 'Customize the composition of your map to make it unique and special. You can add a meaningful title, a motto that captures the essence of the place, and other decorative elements that reflect your personal style. Make every detail tell a story.'
                                    : ''
                            }}
                            {{
                                locale.value == 'es'
                                    ? 'Personaliza la composición de tu mapa para que sea único y especial. Puedes añadir un título significativo, un lema que capture la esencia del lugar y otros elementos decorativos que reflejen tu estilo personal. Haz que cada detalle cuente una historia.'
                                    : ''
                            }}
                        </p>
                    </div>

                    <!-- 5/ORDER -->
                    <div>
                        <div class="w-full flex justify-center mb-4 relative">
                            <div class="absolute bottom-0 w-full h-1/6 bg-gradient-to-b from-transparent to-background"></div>
                            <img src="/images/generar-mapa.webp" class="border border-gray-200" />
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center -mt-2">5</span>
                            <h3 class="mb-2 text-lg md:text-xl font-bold">
                                {{ locale.value == 'en' ? 'Generate the poster of your city' : '' }}
                                {{ locale.value == 'es' ? 'Genera el poster de tu ciudad' : '' }}
                            </h3>
                        </div>
                        <p class=" ">
                            {{
                                locale.value == 'en'
                                    ? 'Create a map in minutes from your personalized composition. The system will start generating your map in high quality and you will receive it in your email in a matter of minutes.'
                                    : ''
                            }}
                            {{
                                locale.value == 'es'
                                    ? 'Crear en minutos un mapa a partir de tu composición personalizada. El sistema se pondrá a generar tu mapa en alta calidad y lo recibirás en tu correo en cuestión de minutos.'
                                    : ''
                            }}
                        </p>
                    </div>

                    <!-- 6/DELIVERY -->
                    <div>
                        <div class="w-full flex justify-center mb-4 relative">
                            <div class="absolute bottom-0 w-full h-1/6 bg-gradient-to-b from-transparent to-background"></div>
                            <img src="/images/mis-mapas.webp" class="border border-gray-200" />
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="bg-black text-white w-7 h-7 rounded-full flex items-center justify-center -mt-2">6</span>
                            <h3 class="mb-2 text-lg md:text-xl font-bold">
                                {{ locale.value == 'en' ? 'Access your maps' : '' }}
                                {{ locale.value == 'es' ? 'Accede a tus mapas' : '' }}
                            </h3>
                        </div>
                        <p class=" ">
                            {{
                                locale.value == 'es'
                                    ? 'Recibirás tu mapa por correo y podrás acceder a él en tu cuenta de usuario. Descárgalo cuando quieras desde cualquier dispositivo. Solo necesitas registrarte con el mismo correo del pedido.'
                                    : ''
                            }}
                            {{
                                locale.value == 'en'
                                    ? 'You will receive your map by email and you can access it in your user account. Download it whenever you want from any device. You just need to register with the same email as the order.'
                                    : ''
                            }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <div class="mx-auto max-w-screen-xl py-16 px-4 md:px-0">
                <div class="max-w-screen-md mb-16 text-center md:text-left">
                    <h2 class="mb-4 text-3xl md:text-4xl tracking-tight font-extrabold">
                        {{ getLocalizedText('Credit-Based Pricing System', 'Sistema de Precios Basado en Créditos', '基于积分的定价系统') }}
                    </h2>
                    <p class="text-lg md:text-xl">
                        {{
                            locale.value == 'en'
                                ? 'Buy credits once and use them to generate maps of any size. Our flexible credit system lets you choose exactly what you need without monthly subscriptions.'
                                : ''
                        }}
                        {{
                            locale.value == 'es'
                                ? 'Compra créditos una vez y úsalos para generar mapas de cualquier tamaño. Nuestro sistema flexible de créditos te permite elegir exactamente lo que necesitas sin suscripciones mensuales.'
                                : ''
                        }}
                    </p>
                </div>
                <!-- Sección de costos y paquetes -->
                <div class="mb-16">
                    <!-- Contenedor de ambas tablas -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <!-- Tabla de costos de generación -->
                        <div>
                            <h3 class="text-xl font-bold text-center mb-6">
                                {{ getLocalizedText('Map Generation Costs', 'Costos de Generación de Mapas', '地图生成成本') }}
                            </h3>

                            <div class="overflow-x-auto border border-gray-300 rounded-lg">
                                <table class="w-full text-left">
                                    <thead class="border-b border-gray-300">
                                        <tr>
                                            <th class="px-4 py-3 text-sm font-semibold text-gray-900">
                                                {{ getLocalizedText('Size', 'Tamaño', '尺寸') }}
                                            </th>
                                            <th class="px-4 py-3 text-sm font-semibold text-gray-900">
                                                {{ getLocalizedText('Resolution', 'Resolución', '分辨率') }}
                                            </th>
                                            <th class="px-4 py-3 text-sm font-semibold text-gray-900 text-center">
                                                {{ getLocalizedText('Cost', 'Costo', '成本') }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        <tr v-for="(sizeData, sizeKey) in mapGenerationCosts" :key="sizeKey" class="hover:bg-gray-50">
                                            <td class="px-4 py-3">
                                                <span class="font-medium text-gray-900 capitalize">
                                                    {{ $t(sizeData.name) }}
                                                </span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <div class="text-sm text-gray-900 font-mono">
                                                    {{
                                                        locale.value == 'en' ? `Max ${sizeData.maxPxSize}px` : `Máx ${sizeData.maxPxSize}px`
                                                    }}
                                                </div>
                                                <div class="text-xs text-gray-500">
                                                    {{
                                                        (() => {
                                                            const cm = (sizeData.maxPxSize / 300) * 2.54;
                                                            const inch = sizeData.maxPxSize / 300;
                                                            return locale.value == 'en'
                                                                ? `${cm.toFixed(1)} cm / ${inch.toFixed(1)} in`
                                                                : `${cm.toFixed(1)} cm / ${inch.toFixed(1)} pulgadas`;
                                                        })()
                                                    }}
                                                </div>
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                                <div class="flex items-center justify-center">
                                                    <span class="text-lg font-bold text-gray-900">{{ sizeData.cost }}</span>
                                                    <span class="ml-1 text-sm text-gray-600">
                                                        {{ locale.value == 'en' ? 'credits' : 'créditos' }}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Tabla de paquetes de créditos -->
                        <div>
                            <h3 class="text-xl font-bold text-center mb-6">
                                {{ locale.value == 'en' ? 'Credit Purchase Packs' : 'Paquetes de Compra de Créditos' }}
                            </h3>

                            <div class="overflow-x-auto border border-gray-300 rounded-lg">
                                <table class="w-full text-left">
                                    <thead class="border-b border-gray-300">
                                        <tr>
                                            <th class="px-4 py-3 text-sm font-semibold text-gray-900">
                                                {{ locale.value == 'en' ? 'Pack' : 'Paquete' }}
                                            </th>
                                            <th class="px-4 py-3 text-sm font-semibold text-gray-900 text-center">
                                                {{ locale.value == 'en' ? 'Credits' : 'Créditos' }}
                                            </th>
                                            <th class="px-4 py-3 text-sm font-semibold text-gray-900 text-center">
                                                {{ locale.value == 'en' ? 'Price' : 'Precio' }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        <tr v-for="pack in creditPurchasePacks" :key="pack.id" class="hover:bg-gray-50">
                                            <td class="px-4 py-3">
                                                <div class="flex items-center">
                                                    <!-- <span class="font-medium text-gray-900 capitalize">{{ pack.id }}</span> -->
                                                </div>
                                                <div class="text-sm" :class="pack.popular ? 'font-bold' : ''">
                                                    {{ $t(pack.description) }}
                                                </div>
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                                <span class="text-lg font-bold">{{ pack.credits }}</span>
                                            </td>
                                            <td class="px-4 py-3 text-center">
                                                <span class="text-lg font-bold">
                                                    {{ locale.value == 'en' ? useFormatPrice(pack.price, true, locale.value, 'USD') : '' }}
                                                    {{ locale.value == 'es' ? useFormatPrice(pack.price, true, locale.value, 'EUR') : '' }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Nota adicional -->
                    <div class="mt-8 rounded-lg">
                        <p class="text-sm text-center">
                            <span class="font-semibold">
                                {{ locale.value == 'en' ? 'Note:' : 'Nota:' }}
                            </span>
                            {{
                                locale.value == 'en'
                                    ? 'Credits are consumed only when generating maps. No monthly fees or subscriptions.'
                                    : 'Los créditos se consumen solo al generar mapas. Sin cuotas mensuales ni suscripciones.'
                            }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <div class="items-center mx-auto max-w-screen-xl gap-8 md:gap-16 grid grid-cols-1 md:grid-cols-3 py-16 px-4 md:px-6">
                <div class="flex justify-center order-2 md:order-1">
                    <div class="max-w-64 md:max-w-96">
                        <ClientOnly>
                            <MapStatic uid="23704b45d0e94756903eafe109e535fc" :interactive="false" />
                        </ClientOnly>
                    </div>
                </div>
                <div class="md:col-span-2 text-center md:text-left order-1 md:order-2">
                    <h2 class="mb-4 text-3xl md:text-4xl tracking-tight font-extrabold">
                        {{
                            getLocalizedText(
                                'Create your next map with Mappic',
                                'Crea tu próximo mapa con Mappic',
                                '使用Mappic创建您的下一张地图'
                            )
                        }}
                    </h2>
                    <p class="mb-6 font-light text-base md:text-lg">
                        {{
                            locale.value == 'en'
                                ? 'Create custom maps of any city in the world in a few minutes. Choose the style, size, and design that best suits your needs and preferences.'
                                : ''
                        }}
                        {{
                            locale.value == 'es'
                                ? 'Crea mapas personalizados de cualquier ciudad del mundo en pocos minutos. Elige el estilo, tamaño y diseño que mejor se adapte a tus necesidades y preferencias.'
                                : ''
                        }}
                    </p>
                    <NuxtLink :to="`/${locale.value}`">
                        <!-- <ZButton :label="capitalize($t(locale.value == 'en' ? 'create map' : 'crea mapa'))" /> -->
                        <UButton size="2xl" :label="capitalize(t(locale.value == 'en' ? 'create map' : 'crea mapa'))" />
                    </NuxtLink>
                </div>
            </div>
        </section>
    </div>
</template>
