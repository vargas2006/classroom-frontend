import { AccessControlProvider } from "@refinedev/core";
import { BACKEND_BASE_URL } from "@/constants";

const AUTH_BASE = BACKEND_BASE_URL.replace(/\/api\/?$/, '');

let cachedRole: string | null = null;
let lastFetchTime = 0;

export async function getCurrentUserRole(): Promise<string | null> {
    const now = Date.now();
    // Cache for 3 seconds to avoid spamming get-session
    if (cachedRole !== null && (now - lastFetchTime < 3000)) {
        return cachedRole;
    }
    try {
        const res = await fetch(`${AUTH_BASE}/api/auth/get-session`, {
            credentials: 'include',
        });
        if (!res.ok) {
            cachedRole = null;
            return null;
        }
        const data = await res.json();
        cachedRole = data?.user?.role ?? 'student';
        lastFetchTime = Date.now();
        return cachedRole;
    } catch {
        return null;
    }
}

export function resetAccessControlCache() {
    cachedRole = null;
    lastFetchTime = 0;
}

export const accessControlProvider: AccessControlProvider = {
    can: async ({ resource, action }) => {
        const role = await getCurrentUserRole();

        if (!role) {
            return { can: false, reason: "Not authenticated" };
        }

        // Admin: unrestricted access to all resources and actions
        if (role === "admin") {
            return { can: true };
        }

        // Teacher permissions
        if (role === "teacher") {
            if (resource === "users") {
                // Teachers can view the user directory, but CANNOT create, edit, or delete users
                if (action === "list" || action === "show") return { can: true };
                return { can: false, reason: "Teachers cannot modify users" };
            }
            if (resource === "departments" || resource === "subjects") {
                // Teachers can view departments & subjects, but CANNOT create, edit, or delete structure
                if (action === "list" || action === "show") return { can: true };
                return { can: false, reason: "Only admins can manage departments and subjects" };
            }
            if (resource === "classes") {
                // Teachers can view, create, and edit classes (cannot delete)
                if (action === "list" || action === "show" || action === "create" || action === "edit") {
                    return { can: true };
                }
                return { can: false, reason: "Teachers cannot delete classes" };
            }
            if (resource === "dashboard" || resource === "settings") {
                return { can: true };
            }
        }

        // Student permissions
        if (role === "student") {
            if (resource === "users") {
                // Hide Users resource completely from students
                return { can: false, reason: "Students do not have access to User Management" };
            }
            if (resource === "departments" || resource === "subjects" || resource === "classes") {
                // Students can only view list & details
                if (action === "list" || action === "show") return { can: true };
                return { can: false, reason: "Students cannot create or edit items" };
            }
            if (resource === "dashboard" || resource === "settings") {
                return { can: true };
            }
        }

        return { can: false, reason: "Unauthorized" };
    },
};
