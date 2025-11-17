//
// IMPORTS
//
import { Items } from 'pleg-connect/firebase';
import { createConfig } from './config.js';
import { createFile } from './file.js';
import { cleanUid } from '~~/helpers';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    getCountFromServer,
    getFirestore,
    doc,
    type QueryConstraint,
    type DocumentSnapshot,
} from 'firebase/firestore';

export interface iMap {
    _ppi: number;
    _pxToCm: (px: number) => number;
    _pxToIn: (px: number) => number;
    _cmToPx: (cm: number) => number;
    collection: InstanceType<typeof Items>;
    getMap: (uid: string) => Promise<any>;
    getMaps: (options?: any) => Promise<any>;
    getExploreMaps: (options?: any) => Promise<any>;
    getMyMaps: (userId: string, options?: any) => Promise<any>;
    getByTicket: (ticket: string) => Promise<any>;
    save: (data: any, options: any) => Promise<any>;
    delete: (uid: string) => Promise<any>;

    archive: (uid: string) => Promise<any>;
    searchMaps: (params: any) => Promise<any>;
    searchSuggestions: (search: string, locale?: string) => Promise<any>;
    calculateSizes: (width: number, aspect: string, unit: string, landscape: boolean) => any;
    addVote: (mapUid: string, userUid: string) => Promise<any>;
    removeVote: (mapUid: string, userUid: string) => Promise<any>;
    hasUserVoted: (mapUid: string, userUid: string) => Promise<boolean>;
    getVoteCount: (mapUid: string) => Promise<number>;
}

// Define una función de fábrica para crear configService
export const createMapService = () => {
    const map: iMap = {
        collection: new Items('maps'),
        _ppi: 300,
        _pxToCm: (px: number): number => {
            const inches = px / map._ppi;
            const cm = inches * 2.54;
            return Math.round(cm * 10) / 10;
        },
        _pxToIn: (px: number): number => {
            const inches = px / map._ppi;
            return Math.round(inches * 10) / 10;
        },
        _cmToPx: (cm: number): number => {
            const inches = cm / 2.54;
            return Math.round(inches * map._ppi);
        },
        getMap: async (uid: string, options?: any): Promise<any> => {
            if (!uid) return null;
            const result = await map.collection.find(uid, options);

            if (!result.success) return { success: false, message: result.message || 'error getting map' };
            return { success: true, data: result.data };
        },
        getMaps: async (options?: any): Promise<any> => {
            const result = await map.collection.get(options);
            return result;
        },
        getExploreMaps: async (options?: any): Promise<any> => {
            try {
                // Obtener instancia de Firestore (inicializada por el plugin 00.firebase-app.client.ts)
                const db = getFirestore();
                const mapsCollection = collection(db, 'maps');

                // Construir constraints de la query
                const constraints: QueryConstraint[] = [];

                // Filtros base
                // Usar 'in' en lugar de '!=' para evitar tener que ordenar por quality primero
                if (options?.filters?.quality && options.filters.quality !== 'all') {
                    // Si hay filtro de calidad específico, usarlo
                    constraints.push(where('quality', '==', options.filters.quality));
                } else {
                    // Si no hay filtro, excluir solo 's' usando 'in' con las demás calidades
                    constraints.push(where('quality', 'in', ['medium', 'high', 'superhigh', 'ultrahigh']));
                }

                constraints.push(where('status', '==', 'success'));
                constraints.push(where('is_purchased_copy', '==', false));

                // Filtros opcionales adicionales
                if (options?.filters) {
                    if (options.filters.style && options.filters.style !== 'all') {
                        constraints.push(where('design.style', '==', options.filters.style));
                    }
                    if (options.filters.composition && options.filters.composition !== 'all') {
                        constraints.push(where('design.composition', '==', options.filters.composition));
                    }
                }

                // Ordenamiento
                // Ahora podemos ordenar directamente por lo que queremos sin tener que ordenar por quality primero
                if (options?.sort === 'votes') {
                    // Ordenar por votos (desc) y luego por fecha (desc)
                    constraints.push(orderBy('votes', 'desc'));
                    constraints.push(orderBy('created_at', 'desc'));
                } else {
                    // Solo ordenar por fecha (desc) - los más recientes primero
                    constraints.push(orderBy('created_at', 'desc'));
                }

                // Paginación
                const page = options?.pagination?.page || 1;
                const pageSize = options?.pagination?.pageSize || 50;

                // Para páginas > 1, necesitamos obtener el último documento de la página anterior
                let lastDoc: any = null;
                if (page > 1) {
                    // Obtener documentos hasta el inicio de la página actual
                    const skipCount = (page - 1) * pageSize;
                    const skipQuery = query(mapsCollection, ...constraints, limit(skipCount));
                    const skipSnapshot = await getDocs(skipQuery);
                    if (skipSnapshot.docs.length > 0) {
                        lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
                    }
                }

                // Construir query final con paginación
                const finalConstraints = [...constraints];
                if (lastDoc) {
                    finalConstraints.push(startAfter(lastDoc));
                }
                finalConstraints.push(limit(pageSize));

                const finalQuery = query(mapsCollection, ...finalConstraints);
                const snapshot = await getDocs(finalQuery);

                // Obtener total de documentos (para paginación)
                const countQuery = query(mapsCollection, ...constraints);
                const countSnapshot = await getCountFromServer(countQuery);
                const total = countSnapshot.data().count;

                // Convertir documentos a objetos
                const items = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        uid: doc.id,
                        ...data,
                    };
                });

                console.log(`✅ getExploreMaps: Obtenidos ${items.length} mapas de ${total} totales (página ${page})`);

                return {
                    success: true,
                    items,
                    total,
                    pages: Math.ceil(total / pageSize),
                    page,
                    pageSize,
                };
            } catch (error: any) {
                console.error('❌ Error en getExploreMaps:', error);

                // Detectar error de índice faltante
                if (error.message && error.message.includes('index')) {
                    console.warn('⚠️ Se requiere crear un índice compuesto en Firestore');
                    console.warn('📋 Firestore mostrará un enlace para crear el índice automáticamente');
                }

                return {
                    success: false,
                    message: error.message || 'Error getting explore maps',
                    items: [],
                    total: 0,
                    pages: 0,
                };
            }
        },
        getMyMaps: async (userId: string, options?: any): Promise<any> => {
            try {
                if (!userId) {
                    return {
                        success: false,
                        message: 'User ID is required',
                        items: [],
                        total: 0,
                        pages: 0,
                    };
                }

                // Obtener instancia de Firestore
                const db = getFirestore();
                const mapsCollection = collection(db, 'maps');

                // Construir constraints de la query
                const constraints: QueryConstraint[] = [];

                // Filtro por usuario (requerido) - usar referencia de Firestore
                const userRef = doc(db, 'users', userId);
                constraints.push(where('user', '==', userRef));

                // Filtros opcionales
                if (options?.filters?.quality && options.filters.quality !== 'all') {
                    constraints.push(where('quality', '==', options.filters.quality));
                }

                if (options?.filters?.style && options.filters.style !== 'all') {
                    constraints.push(where('design.style', '==', options.filters.style));
                }

                if (options?.filters?.composition && options.filters.composition !== 'all') {
                    constraints.push(where('design.composition', '==', options.filters.composition));
                }

                // Ordenamiento
                if (options?.sort === 'votes') {
                    // Ordenar por votos (desc) y luego por fecha (desc)
                    constraints.push(orderBy('votes', 'desc'));
                    constraints.push(orderBy('created_at', 'desc'));
                } else {
                    // Por defecto ordenar por fecha (desc) - los más recientes primero
                    constraints.push(orderBy('created_at', 'desc'));
                }

                // Paginación
                const page = options?.pagination?.page || 1;
                const pageSize = options?.pagination?.pageSize || 50;

                // Para páginas > 1, necesitamos obtener el último documento de la página anterior
                let lastDoc: any = null;
                if (page > 1) {
                    const skipCount = (page - 1) * pageSize;
                    const skipQuery = query(mapsCollection, ...constraints, limit(skipCount));
                    const skipSnapshot = await getDocs(skipQuery);
                    if (skipSnapshot.docs.length > 0) {
                        lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
                    }
                }

                // Construir query final con paginación
                const finalConstraints = [...constraints];
                if (lastDoc) {
                    finalConstraints.push(startAfter(lastDoc));
                }
                finalConstraints.push(limit(pageSize));

                const finalQuery = query(mapsCollection, ...finalConstraints);
                const snapshot = await getDocs(finalQuery);

                // Obtener total de documentos (para paginación)
                const countQuery = query(mapsCollection, ...constraints);
                const countSnapshot = await getCountFromServer(countQuery);
                const total = countSnapshot.data().count;

                // Convertir documentos a objetos
                const items = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        uid: doc.id,
                        ...data,
                    };
                });

                console.log(`✅ getMyMaps: Obtenidos ${items.length} mapas de ${total} totales (página ${page})`);

                return {
                    success: true,
                    items,
                    total,
                    pages: Math.ceil(total / pageSize),
                    page,
                    pageSize,
                };
            } catch (error: any) {
                console.error('❌ Error en getMyMaps:', error);

                return {
                    success: false,
                    message: error.message || 'Error getting user maps',
                    items: [],
                    total: 0,
                    pages: 0,
                };
            }
        },
        getByTicket: async (ticket: string): Promise<any> => {
            if (!ticket) return { success: false, message: 'Ticket is required' };

            try {
                const filters = [{ key: 'ticket', operator: '==', value: ticket }];

                const result = await map.collection.get({ filters, deep: true });

                if (!result.success) {
                    return { success: false, message: result.message || 'Error getting map by ticket' };
                }

                if (result.items.length === 0) {
                    return { success: false, message: 'Map not found' };
                }

                return { success: true, data: result.items[0] };
            } catch (error) {
                return { success: false, message: error instanceof Error ? error.message : String(error) };
            }
        },
        save: async (data: any, options: any): Promise<any> => {
            const result = await map.collection.save(data, options);
            return result;
        },
        delete: async (uid: string): Promise<any> => {
            const uidMap = cleanUid(uid);
            const result = await map.collection.find(uidMap);

            if (result.success) {
                const resultDelete = await map.collection.delete(uidMap);
                return resultDelete;
            }

            return { success: false, message: 'Error deleting map' };
        },
        archive: async (uid: string): Promise<any> => {
            const result = await map.collection.delete(uid, { soft: true });
            return result;
        },
        searchMaps: async (params: any): Promise<any> => {
            try {
                const config = useRuntimeConfig();
                const functionsUrl = config.public.functionsUrl;

                if (!functionsUrl) {
                    throw new Error('functionsUrl is not configured in runtimeConfig');
                }

                // Construir query params
                const queryParams = new URLSearchParams();

                // Query de búsqueda (requerido)
                if (params.q) queryParams.append('q', params.q);

                // Filtros opcionales
                if (params.style && params.style !== 'all') queryParams.append('style', params.style);
                if (params.composition && params.composition !== 'all') queryParams.append('composition', params.composition);
                if (params.quality && params.quality !== 'all') queryParams.append('quality', params.quality);

                // Ordenamiento
                if (params.sort) queryParams.append('sort', params.sort);

                // Límite
                if (params.limit) queryParams.append('limit', params.limit.toString());

                // Hacer request al endpoint
                const url = `${functionsUrl}/search?${queryParams.toString()}`;
                console.log('🔍 Search URL:', url);
                console.log('🔍 Search params:', params);

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Search failed: ${response.statusText}`);
                }

                const data = await response.json();

                return {
                    success: true,
                    items: data.results || [],
                    total: data.total || 0,
                    query: data.query || '',
                    filters: data.filters || {},
                    limit: data.limit || 20,
                };
            } catch (error) {
                console.error('Error searching maps:', error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : String(error),
                    items: [],
                    total: 0,
                };
            }
        },
        searchSuggestions: async (search: string, locale: string = 'en'): Promise<any> => {
            const urlSearch = `https://nominatim.openstreetmap.org/search?format=json&q=${search}&accept-language=${locale}&limit=5&namedetails=1`;
            return await fetch(urlSearch).then(async res => {
                const results = await res.json();
                let resultsFilter = results.filter((item: { addresstype: string }) => item.addresstype !== 'village');
                resultsFilter = resultsFilter.filter(
                    (item: { display_name: any }, index: any, self: any[]) =>
                        self.findIndex(t => t.display_name === item.display_name) === index
                );
                return resultsFilter;
            });
        },
        calculateSizes(width, aspect = '1:1', unit = 'px', landscape = false) {
            if (aspect.indexOf(':') === -1) aspect = '1:1';

            let widthRatio = parseFloat(aspect.split(':')[0]);
            let heightRatio = parseFloat(aspect.split(':')[1]);

            if (landscape) {
                widthRatio = parseFloat(aspect.split(':')[1]);
                heightRatio = parseFloat(aspect.split(':')[0]);
            }

            const sizes: any = {
                width: width,
                height: (width * heightRatio) / widthRatio,
            };

            // Convertir siempre a cm
            if (unit === 'cm') {
                sizes.width = Math.ceil(map._pxToCm(sizes.width));
                sizes.height = Math.ceil(map._pxToCm(sizes.height));
            }

            if (unit === 'in') {
                sizes.width = Math.ceil(map._pxToIn(sizes.width));
                sizes.height = Math.ceil(map._pxToIn(sizes.height));
            }

            if (unit === 'px') {
                sizes.width = Math.round(sizes.width);
                sizes.height = Math.round(sizes.height);
            }

            return sizes;
        },

        // Vote management methods
        addVote: async (mapUid: string, userUid: string): Promise<any> => {
            try {
                // First check if user has already voted
                const hasVoted = await map.hasUserVoted(mapUid, userUid);
                if (hasVoted) {
                    return { success: false, message: 'User has already voted for this map' };
                }

                // Get current map data
                const mapResult = await map.getMap(mapUid);
                if (!mapResult.success) {
                    return { success: false, message: 'Map not found' };
                }

                const currentMap = mapResult.data;
                const currentVotes = currentMap.votes || 0;
                const currentVoters = currentMap.voters || [];

                // Add user to voters list and increment vote count
                const updatedVoters = [...currentVoters, userUid];
                const updatedVotes = currentVotes + 1;

                // Update the map with new vote data
                const updateResult = await map.collection.save({
                    uid: mapUid,
                    votes: updatedVotes,
                    voters: updatedVoters,
                });

                return updateResult;
            } catch (error) {
                console.error('Error adding vote:', error);
                return { success: false, message: error instanceof Error ? error.message : String(error) };
            }
        },

        removeVote: async (mapUid: string, userUid: string): Promise<any> => {
            try {
                // Get current map data
                const mapResult = await map.getMap(mapUid);
                if (!mapResult.success) {
                    return { success: false, message: 'Map not found' };
                }

                const currentMap = mapResult.data;
                const currentVotes = currentMap.votes || 0;
                const currentVoters = currentMap.voters || [];

                // Check if user has voted
                if (!currentVoters.includes(userUid)) {
                    return { success: false, message: 'User has not voted for this map' };
                }

                // Remove user from voters list and decrement vote count
                const updatedVoters = currentVoters.filter((voter: string) => voter !== userUid);
                const updatedVotes = Math.max(0, currentVotes - 1);

                // Update the map with new vote data
                const updateResult = await map.collection.save({
                    uid: mapUid,
                    votes: updatedVotes,
                    voters: updatedVoters,
                });

                return updateResult;
            } catch (error) {
                console.error('Error removing vote:', error);
                return { success: false, message: error instanceof Error ? error.message : String(error) };
            }
        },

        hasUserVoted: async (mapUid: string, userUid: string): Promise<boolean> => {
            try {
                const mapResult = await map.getMap(mapUid);
                if (!mapResult.success) {
                    return false;
                }

                const currentMap = mapResult.data;
                const voters = currentMap.voters || [];
                return voters.includes(userUid);
            } catch (error) {
                console.error('Error checking if user voted:', error);
                return false;
            }
        },

        getVoteCount: async (mapUid: string): Promise<number> => {
            try {
                const mapResult = await map.getMap(mapUid);
                if (!mapResult.success) {
                    return 0;
                }

                const currentMap = mapResult.data;
                return currentMap.votes || 0;
            } catch (error) {
                console.error('Error getting vote count:', error);
                return 0;
            }
        },
    };

    return map;
};
