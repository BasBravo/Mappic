//
// MAP PURCHASE SERVICE
// Handles all map purchase operations
//

import { createMapService } from './map';
import { getMapPurchaseCost, canPurchaseMap } from '~~/data/credits';
import { useAuthStore } from '~~/stores/authStore';
import { randomString } from '~~/helpers/strings';
import { createUser } from './user';

export interface MapPurchaseResponse {
    success: boolean;
    message: string;
    newMapId?: string;
    costDeducted?: number;
}

export interface PurchaseEligibilityResponse {
    canPurchase: boolean;
    reason?: string;
    cost?: number;
}

/**
 * Validates if a user can purchase a specific map
 * @param mapId - The ID of the map to purchase
 * @param buyerId - The ID of the user attempting to purchase
 * @returns Eligibility check result
 */
export async function validatePurchaseEligibility(
    mapId: string,
    buyerId: string
): Promise<PurchaseEligibilityResponse> {
    try {
        const mapService = createMapService();
        const userService = createUser();

        // Get map data
        const mapResult = await mapService.getMap(mapId);
        if (!mapResult.success || !mapResult.data) {
            return {
                canPurchase: false,
                reason: 'Map not found',
            };
        }

        const mapData = mapResult.data;

        // Check if map is purchasable (not small size)
        if (mapData.quality === 's') {
            return {
                canPurchase: false,
                reason: 'Small maps cannot be purchased',
            };
        }

        // Check if user is the owner
        const mapOwner = mapData.user;
        const isOwner =
            mapOwner === `users/${buyerId}` ||
            mapOwner === `doc:users/${buyerId}` ||
            (mapOwner?.uid === buyerId);

        if (isOwner) {
            return {
                canPurchase: false,
                reason: 'You cannot purchase your own map',
            };
        }

        // Get purchase cost
        const cost = getMapPurchaseCost(mapData.quality);

        // Check if user has enough credits
        const userCredits = await userService.getUserCredits(buyerId);
        if (userCredits < cost) {
            return {
                canPurchase: false,
                reason: 'Insufficient credits',
                cost,
            };
        }
        
        return {
            canPurchase: true,
            cost,
        };
    } catch (error) {
        console.error('Error validating purchase eligibility:', error);
        return {
            canPurchase: false,
            reason: 'Error validating purchase',
        };
    }
}

/**
 * Purchases a map for a user by creating a copy with the buyer as owner
 * @param mapId - The ID of the map to purchase
 * @param buyerId - The ID of the user purchasing the map
 * @returns Purchase result with new map ID
 */
export async function purchaseMap(mapId: string, buyerId: string): Promise<MapPurchaseResponse> {
    try {
        const mapService = createMapService();
        const authStore = useAuthStore();

        // Validate eligibility first
        const eligibility = await validatePurchaseEligibility(mapId, buyerId);
        if (!eligibility.canPurchase) {
            return {
                success: false,
                message: eligibility.reason || 'Cannot purchase this map',
            };
        }

        // Get the original map
        const mapResult = await mapService.getMap(mapId);
        if (!mapResult.success || !mapResult.data) {
            return {
                success: false,
                message: 'Map not found',
            };
        }

        const originalMap = mapResult.data;
        const cost = eligibility.cost || getMapPurchaseCost(originalMap.quality);

        // Get buyer's email from auth store
        const buyerEmail = authStore.user?.email || '';

        // Create a copy of the map with the buyer as owner
        const newMapData = {
            ...originalMap,
            uid: undefined, // Remove UID to create new document
            user: `users/${buyerId}`, // Set new owner (correct format without 'doc:')
            email: buyerEmail, // Update email to buyer's email
            ticket: randomString(6), // Generate new ticket
            created_at: new Date(),
            purchased_from: mapId, // Track original map
            is_purchased_copy: true, // Mark as purchased copy
        };

        // Save the new map
        const saveResult = await mapService.save(newMapData, {});

        if (!saveResult.success) {
            return {
                success: false,
                message: 'Error creating map copy',
            };
        }

        // Deduct credits from user
        const userService = createUser();
        const deductResult = await userService.deductCredits(buyerId, cost);

        if (!deductResult.success) {
            console.error('Error deducting credits:', deductResult.message);
            // Note: Map was created but credits weren't deducted
            // In production, this should trigger a refund/rollback
            return {
                success: false,
                message: 'Map created but failed to deduct credits. Please contact support.',
            };
        }

        const newMapId = saveResult.data?.uid || saveResult.uid;

        return {
            success: true,
            message: 'Map purchased successfully',
            newMapId,
            costDeducted: cost,
        };
    } catch (error) {
        console.error('Error purchasing map:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error purchasing map',
        };
    }
}

/**
 * Gets all purchasable maps (excluding small size and user's own maps)
 * @param buyerId - The ID of the current user (to exclude their own maps)
 * @param filters - Additional filters to apply
 * @returns List of purchasable maps
 */
export async function getPurchasableMaps(
    buyerId: string,
    filters?: any
): Promise<{ success: boolean; items: any[]; message?: string }> {
    try {
        const mapService = createMapService();

        // Build filters to exclude small maps and user's own maps
        const defaultFilters = [
            { key: 'quality', operator: '!=', value: 's' }, // Exclude small maps
            { key: 'user', operator: '!=', value: `doc:users/${buyerId}` }, // Exclude user's own maps
        ];

        // Merge with additional filters if provided
        const allFilters = filters ? [...defaultFilters, ...filters] : defaultFilters;

        const result = await mapService.getMaps({
            filters: allFilters,
            deep: true,
        });

        if (!result.success) {
            return {
                success: false,
                items: [],
                message: result.message || 'Error fetching purchasable maps',
            };
        }

        return {
            success: true,
            items: result.items || [],
        };
    } catch (error) {
        console.error('Error getting purchasable maps:', error);
        return {
            success: false,
            items: [],
            message: error instanceof Error ? error.message : 'Error fetching purchasable maps',
        };
    }
}
