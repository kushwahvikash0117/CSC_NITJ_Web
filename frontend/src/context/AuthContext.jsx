/**
 * @file AuthContext.jsx
 * @description Authentication context for managing secure cookie-based user sessions.
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { apiFetch } from "../api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Fetch the currently authenticated user.
     *
     * Authentication is determined entirely by the
     * HttpOnly cookie sent by the browser.
     */
    const refreshAuth = useCallback(async () => {
        try {
            const response = await apiFetch("/api/auth/me");

            if (!response.ok) {
                setUser(null);
                return null;
            }

            const currentUser = await response.json();

            setUser(currentUser);

            return currentUser;
        } catch (error) {
            console.error(
                "Authentication check failed:",
                error
            );

            setUser(null);

            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Login user.
     *
     * The backend:
     * 1. Validates email/password.
     * 2. Creates the JWT.
     * 3. Stores the JWT inside an HttpOnly cookie.
     *
     * The frontend never stores the JWT in localStorage.
     */
    const login = useCallback(
        async (email, password) => {
            const response = await apiFetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed"
                );
            }

            /*
             * The login request succeeded.
             *
             * Now verify that the browser can actually
             * use the newly-created authentication cookie.
             */
            const currentUser = await refreshAuth();

            if (!currentUser) {
                throw new Error(
                    "Login succeeded, but the authentication session could not be established."
                );
            }

            return currentUser;
        },
        [refreshAuth]
    );

    /**
     * Logout current user.
     *
     * Backend clears the HttpOnly cookie.
     * React state is then cleared locally.
     */
    const logout = useCallback(async () => {
        try {
            await apiFetch("/api/auth/logout", {
                method: "POST",
            });
        } catch (error) {
            console.error(
                "Logout request failed:",
                error
            );
        } finally {
            setUser(null);

            /*
             * Remove any legacy authentication data
             * from the old localStorage implementation.
             */
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
        }
    }, []);

    /**
     * Restore authentication session when the
     * application initially loads.
     */
    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    const value = useMemo(
        () => ({
            user,
            loading,
            isLoggedIn: Boolean(user),

            login,
            logout,
            refreshAuth,
        }),
        [
            user,
            loading,
            login,
            logout,
            refreshAuth,
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}