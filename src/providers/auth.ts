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
import { resetAccessControlCache } from './access-control';

// Strip /api suffix to reach the auth root (e.g. http://localhost:8000)
const AUTH_BASE = BACKEND_BASE_URL.replace(/\/api\/?$/, '');

const authProvider: AuthProvider = {
    // ── Login ──────────────────────────────────────────────────────────────
    login: async ({ email, password }: { email: string; password: string }) => {
        try {
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

            resetAccessControlCache();
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
            await fetch(`${AUTH_BASE}/api/auth/sign-out`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Ignore network errors on logout
        }
        resetAccessControlCache();
        return { success: true, redirectTo: '/login' };
    },

    // ── Check (called on every route change) ───────────────────────────────
    check: async () => {
        try {
            const res = await fetch(`${AUTH_BASE}/api/auth/get-session`, {
                credentials: 'include',
            });

            if (!res.ok) return { authenticated: false, redirectTo: '/login' };

            const data = await res.json();
            if (!data?.user) return { authenticated: false, redirectTo: '/login' };

            return { authenticated: true };
        } catch {
            return { authenticated: false, redirectTo: '/login' };
        }
    },

    // ── Identity (used by useGetIdentity) ──────────────────────────────────
    getIdentity: async () => {
        try {
            const res = await fetch(`${AUTH_BASE}/api/auth/get-session`, {
                credentials: 'include',
            });

            if (!res.ok) return null;

            const data = await res.json();
            if (!data?.user) return null;

            const u = data.user;
            return {
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role ?? 'student',
                image: u.image ?? null,
                imageCldPubId: u.imageCldPubId ?? null,
                avatar: u.image ?? null,   // alias for UserAvatar compatibility
            };
        } catch {
            return null;
        }
    },

    // ── Permissions (returns role string) ──────────────────────────────────
    getPermissions: async () => {
        try {
            const res = await fetch(`${AUTH_BASE}/api/auth/get-session`, {
                credentials: 'include',
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data?.user?.role ?? null;
        } catch {
            return null;
        }
    },

    // ── Error handler ──────────────────────────────────────────────────────
    onError: async (error) => {
        if (error?.statusCode === 401 || error?.statusCode === 403) {
            return { logout: true, redirectTo: '/login' };
        }
        return { error };
    },
};

export { authProvider };
