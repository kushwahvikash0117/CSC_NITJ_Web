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
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isLoggedIn: Boolean(user),
      refreshAuth,
      logout,
    }),
    [user, loading, refreshAuth, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
