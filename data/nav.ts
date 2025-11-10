export const navigationConfig = {
    primaryMenuItems: [
        {
            id: 'home',
            icon: 'i-tabler-wand',
            label: 'nav.home',
            route: '/',
        },
        {
            id: 'maps',
            icon: 'i-tabler-map',
            label: 'nav.my_maps',
            route: '/maps/my-maps',
        },
        // {
        //     id: 'market',
        //     icon: 'i-tabler-building-store',
        //     label: 'nav.market',
        //     route: '/market',
        // },
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
    {
        label: 'legal',
        to: `/about/legal`,
    },
];
