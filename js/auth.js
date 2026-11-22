import { deployment } from './deployment-config.js';

// Dynamic import is deliberate: demo builds never download or initialize the Supabase SDK.
const providerPromise = deployment.mode === 'demo'
  ? import('./providers/demo-auth.js')
  : deployment.mode === 'production'
    ? import('./providers/supabase-auth.js')
    : Promise.reject(new Error(`Mode deployment tidak dikenal: ${deployment.mode}`));

export async function getSession() { return (await providerPromise).getSession(); }
export async function getProfile() { return (await providerPromise).getProfile(); }
export async function login(email, password) { return (await providerPromise).login(email, password); }
export async function register(payload) { return (await providerPromise).register(payload); }
export async function logout() { return (await providerPromise).logout(); }
