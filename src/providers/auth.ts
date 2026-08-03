/**
 * auth.ts — Refine AuthProvider backed by better-auth session cookies.
 *
 * Endpoints used (all on the backend under /api/auth/...):
 *   POST /api/auth/sign-in/email   — login
 *   POST /api/auth/sign-out        — logout
 *   GET  /api/auth/get-session     — session check + identity
 */

import { AuthProvider } from '@refinedev/core';
import { BACKEND_BASE_URL } from '@/constants';

// Strip /api suffix to reach the auth root (e.g. http://localhost:8000)
const AUTH_BASE = BACKEND_BASE_URL.replace(/\/api\/?$/, '');

// ── In-Memory Session Cache & Request Deduping ─────────────────────────────
let sessionCache: { data: any; timestamp: number } | null = null;
let sessionPromise: Promise<any> | null = null;
const CACHE_TTL_MS = 30_000; // 30-second cache TTL — matches React Query staleTime in App.tsx

const fetchSession = async (forceRefresh = false): Promise<any> => {
    const now = Date.now();
    if (!forceRefresh && sessionCache && now - sessionCache.timestamp < CACHE_TTL_MS) {
        return sessionCache.data;
    }
    if (sessionPromise && !forceRefresh) {
        return sessionPromise;
    }

    sessionPromise = (async () => {
        try {
            const res = await fetch(`${AUTH_BASE}/api/auth/get-session`, {
                credentials: 'include',
            });
            if (!res.ok) {
                sessionCache = null;
                return null;
            }
            const data = await res.json();
            sessionCache = { data, timestamp: Date.now() };
            return data;
        } catch {
            sessionCache = null;
            return null;
        } finally {
            sessionPromise = null;
        }
    })();

    return sessionPromise;
};

const clearSessionCache = () => {
    sessionCache = null;
    sessionPromise = null;
};

const authProvider: AuthProvider = {
    // ── Login ──────────────────────────────────────────────────────────────
    login: async ({ email, password }: { email: string; password: string }) => {
        try {
            clearSessionCache();
            const res = await fetch(`${AUTH_BASE}/api/auth/sign-in/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                return {
                    success: false,
                    error: {
                        name: 'LoginError',
                        message: body?.error ?? body?.message ?? 'Invalid email or password.',
                    },
                };
            }

            // Warm the cache with fresh session after login
            await fetchSession(true);
            return { success: true, redirectTo: '/' };
        } catch {
            return {
                success: false,
                error: { name: 'NetworkError', message: 'Unable to connect to the server.' },
            };
        }
    },

    // ── Logout ─────────────────────────────────────────────────────────────
    logout: async () => {
        try {
            clearSessionCache();
            await fetch(`${AUTH_BASE}/api/auth/sign-out`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Ignore network errors on logout
        }
        return { success: true, redirectTo: '/login' };
    },

    // ── Check (called on every route change) ───────────────────────────────
    check: async () => {
        try {
            const data = await fetchSession();
            if (!data?.user) return { authenticated: false, redirectTo: '/login' };
            return { authenticated: true };
        } catch {
            return { authenticated: false, redirectTo: '/login' };
        }
    },

    // ── Identity (used by useGetIdentity) ──────────────────────────────────
    getIdentity: async () => {
        try {
            const data = await fetchSession();
            if (!data?.user) return null;

            const u = data.user;
            return {
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role ?? 'student',
                image: u.image ?? null,
                imageCldPubId: u.imageCldPubId ?? null,
                avatar: u.image ?? null, // alias for UserAvatar compatibility
            };
        } catch {
            return null;
        }
    },

    // ── Permissions (returns role string) ──────────────────────────────────
    getPermissions: async () => {
        try {
            const data = await fetchSession();
            return data?.user?.role ?? null;
        } catch {
            return null;
        }
    },

    // ── Error handler ──────────────────────────────────────────────────────
    onError: async (error) => {
        // 401 from the data provider means the session expired or was never sent.
        // Clear cache and let Refine's <Authenticated> handle the redirect via `check`.
        if (error?.statusCode === 401) {
            clearSessionCache();
            return { logout: true, redirectTo: '/login' };
        }
        // 403 means authenticated but not authorized — do NOT log out, just surface the error.
        return { error };
    },
};

export { authProvider, clearSessionCache };
