import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Prioritize platform-injected API_KEY, then VITE_API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || ''),
      // New Supabase Credentials
      'process.env.VITE_SUPABASE_URL': JSON.stringify('https://ehxpvgjpnhtquymukekb.supabase.co'),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('sb_publishable_ByFgrbFA8RtK28FxqcJEww_C-PNYnrV'),
    }
  }
})