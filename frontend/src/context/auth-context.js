/**
 * @file auth-context.js
 * @description Authentication context definition and custom hook for managing user sessions across the React application.
 */

import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

/**
 * Custom hook to access authentication context values and methods.
 * @returns {Object} The current authentication context.
 * @throws {Error} If used outside of an AuthProvider.
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}