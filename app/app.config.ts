export default defineAppConfig({
    ui: {
        input: {
            slots: {
                base: 'rounded-full  ',
            },
            variants: {
                variant: {
                    outline:
                        'bg-white ring-black/20 dark:bg-black/20  dark:ring-black/40 focus-visible:ring-black/40 focus-visible:ring-1 dark:focus-visible:ring-1 dark:focus-visible:ring-primary shadow-none',
                },
                size: {
                    '2xl': {
                        base: 'px-4 py-3 text-lg gap-2.5',
                        leading: 'ps-4',
                        trailing: 'pe-4',
                        leadingIcon: 'size-6',
                        leadingAvatarSize: 'sm',
                        trailingIcon: 'size-6',
                    },
                    '3xl': {
                        base: 'px-5 py-4 text-xl gap-3',
                        leading: 'ps-5',
                        trailing: 'pe-5',
                        leadingIcon: 'size-6',
                        leadingAvatarSize: 'sm',
                        trailingIcon: 'size-7',
                    },
                    '4xl': {
                        base: 'px-6 py-5 text-2xl gap-3.5',
                        leading: 'ps-6',
                        trailing: 'pe-6',
                        leadingIcon: 'size-8',
                        leadingAvatarSize: 'md',
                        trailingIcon: 'size-8',
                    },
                },
            },
            compoundVariants: [
                {
                    leading: true,
                    size: '2xl' as any,
                    class: 'ps-12',
                },
                {
                    leading: true,
                    size: '3xl' as any,
                    class: 'ps-14',
                },
                {
                    leading: true,
                    size: '4xl' as any,
                    class: 'ps-16',
                },
                {
                    trailing: true,
                    size: '2xl' as any,
                    class: 'pe-12',
                },
                {
                    trailing: true,
                    size: '3xl' as any,
                    class: 'pe-14',
                },
                {
                    trailing: true,
                    size: '4xl' as any,
                    class: 'pe-16',
                },
            ],
        },
        textarea: {
            slots: {
                base: 'rounded-2xl',
            },
            variants: {
                variant: {
                    outline:
                        'bg-white ring-black/20 dark:bg-black/20  dark:ring-black/40 focus-visible:ring-black/40 focus-visible:ring-1 dark:focus-visible:ring-1 dark:focus-visible:ring-primary shadow-none',
                },
                size: {
                    '2xl': {
                        base: 'px-4 py-3 text-lg gap-2.5',
                        leading: 'ps-4',
                        trailing: 'pe-4',
                        leadingIcon: 'size-6',
                        leadingAvatarSize: 'sm',
                        trailingIcon: 'size-6',
                    },
                    '3xl': {
                        base: 'px-5 py-4 text-xl gap-3',
                        leading: 'ps-5',
                        trailing: 'pe-5',
                        leadingIcon: 'size-6',
                        leadingAvatarSize: 'sm',
                        trailingIcon: 'size-7',
                    },
                    '4xl': {
                        base: 'px-6 py-5 text-2xl gap-3.5',
                        leading: 'ps-6',
                        trailing: 'pe-6',
                        leadingIcon: 'size-8',
                        leadingAvatarSize: 'md',
                        trailingIcon: 'size-8',
                    },
                },
            },
        },
        button: {
            slots: {
                base: 'rounded-full ',
            },
            variants: {
                size: {
                    '2xl': {
                        base: 'px-4 py-3 text-lg gap-2.5',
                        leadingIcon: 'size-6',
                        leadingAvatarSize: 'sm',
                        trailingIcon: 'size-6',
                    },
                    '3xl': {
                        base: 'px-5 py-4 text-xl gap-3',
                        leadingIcon: 'size-7',
                        leadingAvatarSize: 'sm',
                        trailingIcon: 'size-7',
                    },
                    '4xl': {
                        base: 'px-6 py-5 text-2xl gap-3.5',
                        leadingIcon: 'size-8',
                        leadingAvatarSize: 'md',
                        trailingIcon: 'size-8',
                    },
                },
            },
            compoundVariants: [
                {
                    color: 'neutral',
                    variant: 'outline',
                    class: 'ring-black/10',
                },
                {
                    size: '2xl' as any,
                    square: true,
                    class: 'p-3',
                },
                {
                    size: '3xl' as any,
                    square: true,
                    class: 'p-4',
                },
                {
                    size: '4xl' as any,
                    square: true,
                    class: 'p-5',
                },
            ],
        },
        slider: {
            slots: {
                track: 'bg-secondary/20',
                range: 'absolute',
            },
        },
        switch: {
            slots: {
                base: 'data-[state=unchecked]:bg-black/20 bg-default',
            },
        },
        select: {
            slots: {
                base: 'rounded-full ',
                content: 'rounded-2xl',
            },
            variants: {
                variant: {
                    outline:
                        'bg-black/5 ring-black/20 dark:bg-black/20  dark:ring-black/40 focus-visible:ring-black/40 focus-visible:ring-1 dark:focus-visible:ring-1 dark:focus-visible:ring-primary shadow-none',
                },
                size: {
                    '2xl': {
                        base: 'px-4 py-3 text-lg gap-2.5',
                        leadingIcon: 'size-6',
                        leadingAvatarSize: 'sm',
                        trailingIcon: 'size-6',
                    },
                    '3xl': {
                        base: 'px-5 py-4 text-xl gap-3',
                        leadingIcon: 'size-7',
                        leadingAvatarSize: 'sm',
                        trailingIcon: 'size-7',
                    },
                    '4xl': {
                        base: 'px-6 py-5 text-2xl gap-3.5',
                        leadingIcon: 'size-8',
                        leadingAvatarSize: 'md',
                        trailingIcon: 'size-8',
                    },
                },
            },
            defaultVariants: {
                size: 'lg',
                color: 'primary',
                variant: 'outline',
            },
        },
        dropdownMenu: {
            slots: {
                content: 'rounded-2xl',
            },
        },
        modal: {
            slots: {
                content: 'divide-none p-2 bg-muted/70 backdrop-blur-lg',
                close: 'absolute top-6 end-6',
            },
            variants: {
                fullscreen: {
                    false: {
                        content: 'rounded-4xl',
                    },
                },
            },
        },
        popover: {
            slots: {
                content: 'shadow-2xl rounded-3xl',
                arrow: 'fill-default',
            },
        },
        toast: {
            slots: {
                base: 'rounded-3xl',
                close: 'absolute top-4 end-4',
            },
        },
        formField: {
            slots: {
                root: 'field',
            },
        },
    },
    toaster: {
        position: 'bottom-center' as const,
        expand: true,
        duration: 5000,
    },
});
