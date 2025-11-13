export const navigationConfig = {
    primaryMenuItems: [
        {
            id: 'home',
            icon: 'i-tabler-smart-home',
            label: 'nav.home',
            route: '/',
        },
        {
            id: 'explore',
            icon: 'i-tabler-search',
            label: 'nav.explore',
            route: '/maps/explore',
        },
        {
            id: 'maps',
            icon: 'i-tabler-map',
            label: 'nav.my_maps',
            route: '/maps/my-maps',
        },
        {
            id: 'about',
            icon: 'i-tabler-info-hexagon',
            label: 'nav.about',
            route: '/about',
        },
    ],
    bottomMenuItems: [],
    utilityItems: [],
    expandableItems: [],
};

export const aboutPages = [
    {
        label: 'project about',
        to: `/about`,
        active: true,
    },
    {
        label: 'the dev',
        to: `/about/bas`,
    },
    {
        label: 'change log',
        to: `/about/changelog`,
    },
];
