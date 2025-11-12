// ==============================================
// MAP GENERATION COSTS (what it costs to generate maps)
// ==============================================

// Cost per map generation in credits
export const mapGenerationCosts = {
    s: {
        cost: 1,
        name: 'small',
        maxPxSize: 2000,
    },
    m: {
        cost: 2,
        name: 'medium',
        maxPxSize: 5000,
    },
    l: {
        cost: 5,
        name: 'large',
        maxPxSize: 8000,
    },
    xl: {
        cost: 10,
        name: 'high',
        maxPxSize: 11000,
    },
    xxl: {
        cost: 12,
        name: 'ultrahigh',
        maxPxSize: 15000,
    },
} as const;

export const getMapGenerationCost = (size: string): number => {
    return mapGenerationCosts[size.toLowerCase() as keyof typeof mapGenerationCosts]?.cost || 1;
};

export const canGenerateMap = (userCredits: number, mapSize: string): boolean => {
    const cost = getMapGenerationCost(mapSize);
    return userCredits >= cost;
};

// ==============================================
// CREDIT PURCHASE PACKS (what users can buy)
// ==============================================

export interface CreditPurchasePack {
    id: string;
    credits: number;
    stripeUrl: string;
    description: string;
    popular?: boolean;
    price?: string; // Optional price display (e.g., "$9.99")
}

export const creditPurchasePacks: CreditPurchasePack[] = [
    {
        id: 'starter',
        credits: 10,
        stripeUrl: 'https://buy.stripe.com/5kQ14obNk0HPdp13VtbZe0e',
        description: 'Perfect for trying out',
        price: '4.99',
    },
    {
        id: 'popular',
        credits: 30,
        stripeUrl: 'https://buy.stripe.com/fZu5kE2cK8ah84HajRbZe0g',
        description: 'Most popular choice',
        popular: true,
        price: '12.99',
    },
    {
        id: 'professional',
        credits: 50,
        stripeUrl: 'https://buy.stripe.com/28E7sMcRo2PX2Kn1NlbZe0h',
        description: 'Great for covering an entire wall',
        price: '19.99',
    },
    {
        id: 'business',
        credits: 100,
        stripeUrl: 'https://buy.stripe.com/00wdRa4kS3U1et577FbZe0i',
        description: 'For map enthusiasts',
        price: '34.99',
    },
];

// Helper functions for credit purchase packs
export const getCreditPurchasePackById = (id: string): CreditPurchasePack | undefined => {
    return creditPurchasePacks.find(pack => pack.id === id);
};

export const getPopularCreditPurchasePack = (): CreditPurchasePack | undefined => {
    return creditPurchasePacks.find(pack => pack.popular);
};

// ==============================================
// MAP PURCHASE COSTS (what it costs to buy maps)
// ==============================================

export const mapPurchaseCosts = {
    m: {
        cost: 1,
        name: 'medium',
    },
    l: {
        cost: 3,
        name: 'large',
    },
    xl: {
        cost: 5,
        name: 'high',
    },
    xxl: {
        cost: 6,
        name: 'ultrahigh',
    },
} as const;

export const getMapPurchaseCost = (size: string): number => {
    return mapPurchaseCosts[size.toLowerCase() as keyof typeof mapPurchaseCosts]?.cost || 1;
};

export const canPurchaseMap = (userCredits: number, mapSize: string): boolean => {
    const cost = getMapPurchaseCost(mapSize);
    return userCredits >= cost;
};

export const getMapPurchaseCostFromGenerationCost = (generationCost: number): number => {
    return Math.ceil(generationCost / 2);
};

// ==============================================
// LEGACY EXPORTS (for backward compatibility)
// ==============================================

// Alias for backward compatibility
export const creditPacks = creditPurchasePacks;
