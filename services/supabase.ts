import { createClient } from '@supabase/supabase-js';

// User provided Supabase Credentials (Updated for project: NattyDisco Hub With Sthe)
const supabaseUrl = 'https://ehxpvgjpnhtquymukekb.supabase.co';
const supabaseKey = 'sb_publishable_ByFgrbFA8RtK28FxqcJEww_C-PNYnrV';

// Initialize the production-ready Supabase client
const realClient = createClient(supabaseUrl, supabaseKey);

export const authDB = {
    signUp: async (email: string, pass: string) => {
        return await (realClient.auth as any).signUp({ email, password: pass });
    },
    signIn: async (email: string, pass: string) => {
        try {
            const result = await (realClient.auth as any).signInWithPassword({ email, password: pass });
            if (result.error) {
                if (result.error.message.includes('Invalid login credentials')) {
                    throw new Error("Registry Match Failed: Check email or password.");
                }
                throw result.error;
            }
            return result;
        } catch (e: any) {
            if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
                 throw new Error("Supabase Handshake Failed: Registry unreachable. Check connection.");
            }
            throw e;
        }
    },
    signOut: async () => {
        return await (realClient.auth as any).signOut();
    },
    getSession: async () => {
        return await (realClient.auth as any).getSession();
    },
    onAuthStateChange: (callback: any) => {
        return (realClient.auth as any).onAuthStateChange(callback);
    }
};

export const cloudDB = {
    fetch: async (table: string) => {
        try {
            const { data, error } = await realClient.from(table).select('*');
            if (error) {
                console.error(`Supabase fetch error for table "${table}":`, error);
                // If it's a permission/RLS error, return empty array instead of throwing
                if (error.code === 'PGRST116' || error.message?.includes('permission') || error.message?.includes('RLS')) {
                    console.warn(`Permission denied for table "${table}". Returning empty array.`);
                    return [];
                }
                throw error;
            }
            return data || [];
        } catch (err: any) {
            console.error(`Unexpected error fetching table "${table}":`, err);
            // Return empty array for graceful degradation
            if (err.message?.includes('Failed to fetch') || err.code === 'ECONNREFUSED') {
                console.warn(`Network error for table "${table}". Returning empty array.`);
                return [];
            }
            throw err;
        }
    },
    get: async (table: string, id: string | number) => {
        try {
            const { data, error } = await realClient.from(table).select('*').eq('id', id).maybeSingle();
            if (error) {
                console.error(`Supabase get error for table "${table}" id "${id}":`, error);
                if (error.code === 'PGRST116' || error.message?.includes('permission')) {
                    return null;
                }
                throw error;
            }
            return data;
        } catch (err: any) {
            console.error(`Unexpected error getting from table "${table}":`, err);
            return null;
        }
    },
    upsert: async (table: string, data: any) => {
        const { error } = await realClient.from(table).upsert(data);
        if (error) {
            console.error(`Supabase upsert error for table "${table}":`, error);
            throw error;
        }
    },
    delete: async (table: string, id: string | number) => {
        const { error } = await realClient.from(table).delete().eq('id', id);
        if (error) {
            console.error(`Supabase delete error for table "${table}" id "${id}":`, error);
            throw error;
        }
    },
    bulkUpsert: async (table: string, data: any[]) => {
        const { error } = await realClient.from(table).upsert(data);
        if (error) {
            console.error(`Supabase bulkUpsert error for table "${table}":`, error);
            throw error;
        }
    }
};

export const cloudStorage = {
    upload: async (bucket: string, file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await realClient.storage.from(bucket).upload(filePath, file);
        if (error) throw error;

        const { data: { publicUrl } } = realClient.storage.from(bucket).getPublicUrl(filePath);
        return { publicUrl, fileName: file.name };
    }
};