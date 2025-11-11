<template>
    <div class="fixed h-full w-fit top-0 left-0 right-0 z-50 px-6 py-4">
        <ElementsSidebar />
    </div>
    <main class="absolute z-10 left-0 top-0 flex flex-col w-full h-full min-h-screen px-6 py-8 md:pl-28">
        <div class="fixed top-3 md:top-3 left-20 right-0 md:right-2 z-50 pr-2 md:p-2 pt-4 md:pl-6">
            <ElementsHeader />
        </div>
        <slot />
    </main>

    <!-- Cookie Banner and Modal -->
    <ClientOnly>
        <CookiesBanner />
        <CookiesModal />
    </ClientOnly>
</template>
