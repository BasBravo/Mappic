//
// IMPORTS
//
import { Items } from 'pleg-connect/firebase';
//
// INTERFACES
//
export interface iConfig {
    collection: InstanceType<typeof Items>;
    getConfig: (uid: string | null) => Promise<any>;
    getDefaultCredits: () => Promise<number>;
}
//
// EXPORT
//
export const createConfig = (): iConfig => {
    const config: iConfig = {
        collection: new Items('config'),

        getConfig: async (uid: string | null) => {
            if (!uid) uid = 'default';
            return await config.collection.find(uid);
        },

        getDefaultCredits: async (): Promise<number> => {
            try {
                const result = await config.collection.find('default');
                if (result.success && result.data && typeof result.data.defaultCredits === 'number') {
                    return result.data.defaultCredits;
                }
                // Return 3 as fallback if not configured
                return 3;
            } catch (error) {
                console.error('Error getting default credits from config:', error);
                return 3; // Fallback to 3 credits
            }
        },
    };

    return config;
};
