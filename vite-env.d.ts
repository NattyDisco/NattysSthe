
// This file is now used to provide types for environment variables defined via Vite's `define` config.

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    // FIX: Added Supabase environment variable types.
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }
}