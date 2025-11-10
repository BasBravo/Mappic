//
// IMPORTS
//
import { Auth } from 'pleg-connect/firebase';
import { createApi } from './api';
import { createUser as createUserService } from './user';
import { createConfig } from './config';
//
// INTERFACE
//
export interface iAuth {
    _firebaseAuth: InstanceType<typeof Auth> | null;
    _init: () => Promise<void>;
    login: (email: string, password: string) => Promise<any>;
    register: (email: string, password: string, name: string) => Promise<any>;
    logout: () => Promise<any>;
    resetPassword: (email: string) => Promise<any>;
    loginWithGoogle: () => Promise<any>;
    loginWithGitHub: () => Promise<any>;
    verifyToken: (token: string) => Promise<any>;
    getToken: () => Promise<string>;
    createUser: (email: string, name: string, uid?: string) => Promise<any>;
}
//
// FACTORY FUNCTION
//
export const createAuth = (): iAuth => {
    const apiService = createApi();
    const configService = createConfig();
    
    const auth: iAuth = {
        _firebaseAuth: null,
        
        _init: async () => {
            if (!auth._firebaseAuth) {
                auth._firebaseAuth = new Auth();
            }
        },
        
        login: async (email: string, password: string) => {
            await auth._init();
            const normalizedEmail = email.toLowerCase().trim();
            const parsePassword = password.trim();
            const result = await auth._firebaseAuth!.login(normalizedEmail, parsePassword);

            if (result.success) {
                const userResult = await auth.createUser(result.email, result.name || 'User', result.uid);
                
                // Inicializar créditos si el login fue exitoso
                if (result.uid) {
                    const userService = createUserService();
                    const defaultCredits = await configService.getDefaultCredits();
                    await userService.initializeUserCredits(result.uid, defaultCredits);
                }
                
                return {
                    ...result,
                    userData: userResult
                };
            }

            return result;
        },
        
        register: async (email: string, password: string, name: string) => {
            await auth._init();
            const normalizedEmail = email.toLowerCase().trim();
            const parsePassword = password.trim();
            const result = await auth._firebaseAuth!.createUser(normalizedEmail, parsePassword, name);
            
            console.log('Firebase register result:', result);
            
            if (result.success) {
                console.log('Creating user in database with:', { email: normalizedEmail, name, uid: result.uid });
                const userResult = await auth.createUser(normalizedEmail, name, result.uid);
                console.log('User creation result:', userResult);
                
                // Inicializar créditos si el registro fue exitoso
                if (result.uid) {
                    console.log('Initializing credits for user:', result.uid);
                    const userService = createUserService();
                    const defaultCredits = await configService.getDefaultCredits();
                    console.log('Default credits from config:', defaultCredits);
                    const creditResult = await userService.initializeUserCredits(result.uid, defaultCredits);
                    console.log('Credit initialization result:', creditResult);
                }
                
                return {
                    ...result,
                    userData: userResult
                };
            }
            
            return result;
        },
        
        logout: async () => {
            try {
                await auth._init();
                const result = await auth._firebaseAuth!.logout();
                return result;
            } catch (error) {
                return { success: false, message: 'logout-error' };
            }
        },
        
        resetPassword: async (email: string) => {
            try {
                await auth._init();
                const result = await auth._firebaseAuth!.resetPassword(email);
                return result;
            } catch (error) {
                return { success: false, message: 'reset-password-error' };
            }
        },
        
        loginWithGoogle: async () => {
            await auth._init();
            const languageCode = localStorage.getItem('locale') ?? 'en';
            const result = await auth._firebaseAuth!.loginWithService('google', { languageCode });

            if (result.success) {
                const parts = result.name?.split(' ') || ['User'];
                const name = parts.length > 1 ? parts[0] : result.name || 'User';
                const normalizedEmail = result.email?.toLowerCase().trim() || '';
                const userResult = await auth.createUser(normalizedEmail, name, result.uid);
                
                // Inicializar créditos si el login fue exitoso
                if (result.uid) {
                    const userService = createUserService();
                    const defaultCredits = await configService.getDefaultCredits();
                    await userService.initializeUserCredits(result.uid, defaultCredits);
                }
                
                return {
                    ...result,
                    userData: userResult
                };
            }
            return result ?? { success: false, message: 'login-failed' };
        },
        
        loginWithGitHub: async () => {
            await auth._init();
            const languageCode = localStorage.getItem('locale') ?? 'en';
            const result = await auth._firebaseAuth!.loginWithService('github', { languageCode });

            if (result.success) {
                const parts = result.name?.split(' ') || ['User'];
                const name = parts.length > 1 ? parts[0] : result.name || 'User';
                const normalizedEmail = result.email?.toLowerCase().trim() || '';
                const userResult = await auth.createUser(normalizedEmail, name, result.uid);
                
                // Inicializar créditos si el login fue exitoso
                if (result.uid) {
                    const userService = createUserService();
                    const defaultCredits = await configService.getDefaultCredits();
                    await userService.initializeUserCredits(result.uid, defaultCredits);
                }
                
                return {
                    ...result,
                    userData: userResult
                };
            }
            return result ?? { success: false, message: 'login-failed' };
        },
        
        verifyToken: async (token: string) => {
            try {
                const runtimeConfig = useRuntimeConfig();
                const url = runtimeConfig.public.functionsUrl + '/auth/verify-token';

                const result = await apiService.request(url, {
                    method: 'POST',
                    body: { token },
                });

                return result;
            } catch (error) {
                return { success: false, message: 'token-verification-error' };
            }
        },
        
        createUser: async (email: string, name: string, uid?: string) => {
            const normalizedEmail = email.toLowerCase().trim();
            console.log('createUser called with:', { email: normalizedEmail, name, uid });
            await auth._init();
            const userService = createUserService();
            const filter = [{ field: 'email', operator: '==', value: normalizedEmail }];
            console.log('Checking for existing user with filter:', filter);
            const resultUsers = await userService.getUsers({ filters: filter });
            console.log('Existing user check result:', resultUsers);

            if (resultUsers.success && resultUsers.items.length > 0) {
                console.log('User already exists, returning existing user');
                return { success: true, data: resultUsers.items[0] };
            }

            console.log('User does not exist, creating new user');
            const defaultCredits = await configService.getDefaultCredits();
            console.log('Default credits:', defaultCredits);
            const data: any = {
                email: normalizedEmail,
                name,
                status: 'active',
                role: 'user',
                credits: defaultCredits, // Add default credits for new users from config
            };

            if (uid) data.uid = uid;
            console.log('User data to save:', data);

            const result = await userService.save(data);
            console.log('Save result:', result);

            if (result.success) {
                return result;
            }

            return { success: false, message: 'user-not-created' };
        },
        
        getToken: async () => {
            const fireAuth = new Auth();
            const token = await fireAuth.refreshToken();
            return token ?? '';
        },
    };

    return auth;
};
