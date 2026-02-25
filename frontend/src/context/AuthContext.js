import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "mediflow_token";
const USER_KEY = "mediflow_user";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = "mediflow_last_activity";

function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [sessionExpired, setSessionExpired] = useState(false);

  const updateLastActivity = useCallback(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    setToken(null);
    setUser(null);
    setSessionExpired(false);
    // Force a complete page reload to clear all in-memory state and sensitive data
    window.location.href = "/login";
  }, []);

  const login = useCallback((userData, authToken) => {
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    updateLastActivity();
    setUser(userData);
    setToken(authToken);
    setSessionExpired(false);
  }, [updateLastActivity]);

  // Session timeout: check inactivity periodically
  useEffect(() => {
    if (!token) return;

    const checkSession = () => {
      const last = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!last) return;
      const elapsed = Date.now() - Number(last);
      if (elapsed >= SESSION_TIMEOUT_MS) {
        setSessionExpired(true);
        logout();
      }
    };

    const interval = setInterval(checkSession, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, [token, logout]);

  // Update last activity on user interaction (throttled in real app; here we refresh on focus)
  useEffect(() => {
    if (!token) return;
    const onActivity = () => updateLastActivity();
    window.addEventListener("focus", onActivity);
    return () => window.removeEventListener("focus", onActivity);
  }, [token, updateLastActivity]);

  // Cross-tab synchronization and external logout signals
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === TOKEN_KEY && !e.newValue) {
        // Token was removed in another tab
        setUser(null);
        setToken(null);
        window.location.href = "/login";
      }
    };

    const handleExternalLogout = () => {
      logout();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-logout", handleExternalLogout);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-logout", handleExternalLogout);
    };
  }, [logout]);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    sessionExpired,
    setSessionExpired,
    updateLastActivity,
    isAdmin: user?.role === "Admin",
    isProvider: user?.role === "Provider" || user?.role === "Admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
