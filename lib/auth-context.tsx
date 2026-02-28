'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from './types';
import { loginAction, refreshAction, logoutAction, type LoginResponse } from './actions';
import { decodeJwtPayload, backendRoleToFrontend } from './jwt';
import { ApiError, parseActionError } from './api-client';

const STORAGE_ACCESS = 'takatack_access_token';
const STORAGE_REFRESH = 'takatack_refresh_token';

function getStoredTokens(): { accessToken: string; refreshToken: string } | null {
  if (typeof window === 'undefined') return null;
  const access = localStorage.getItem(STORAGE_ACCESS);
  const refresh = localStorage.getItem(STORAGE_REFRESH);
  if (access && refresh) return { accessToken: access, refreshToken: refresh };
  return null;
}

function storeTokens(access: string, refresh: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_ACCESS, access);
  localStorage.setItem(STORAGE_REFRESH, refresh);
}

function clearStoredTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_ACCESS);
  localStorage.removeItem(STORAGE_REFRESH);
}

export function getAccessToken(): string | null {
  const t = getStoredTokens();
  return t?.accessToken ?? null;
}

function userFromToken(accessToken: string, loginResponse?: LoginResponse): User {
  const payload = decodeJwtPayload(accessToken);
  const sub = (payload?.sub as string) || '';
  const userId = (payload?.userId as number) ?? 0;
  const tenantId = (payload?.tenantId as string) ?? loginResponse?.tenantId ?? '';
  const schemaName = (payload?.schema as string) ?? loginResponse?.schemaName ?? '';
  const roleRaw = (payload?.role as string) ?? loginResponse?.role ?? 'RESIDENT';
  const role = backendRoleToFrontend(roleRaw) as User['role'];
  const name = sub ? sub.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'User';

  return {
    id: String(userId),
    email: sub,
    name,
    phone: '',
    role,
    isActive: true,
    createdAt: new Date().toISOString(),
    tenantId: tenantId ? String(tenantId) : undefined,
    schemaName: schemaName || undefined,
    mustChangePassword: loginResponse?.mustChangePassword ?? undefined,
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshSession: () => Promise<boolean>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const tokens = getStoredTokens();
    if (!tokens?.refreshToken) return false;
    const data = await refreshAction(tokens.refreshToken);
    if (!data) {
      clearStoredTokens();
      setUser(null);
      return false;
    }
    storeTokens(data.accessToken, data.refreshToken);
    setUser(userFromToken(data.accessToken, data));
    return true;
  }, []);

  useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens?.accessToken) {
      setLoading(false);
      return;
    }
    const payload = decodeJwtPayload(tokens.accessToken);
    const exp = (payload?.exp as number) | 0;
    const now = Math.floor(Date.now() / 1000);
    if (exp && exp > now) {
      setUser(userFromToken(tokens.accessToken));
      setLoading(false);
      return;
    }
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginAction(email, password);
      storeTokens(data.accessToken, data.refreshToken);
      setUser(userFromToken(data.accessToken, data));
      return { mustChangePassword: data.mustChangePassword };
    } catch (e) {
      const parsed = parseActionError(e);
      if (parsed) throw new ApiError(parsed.status, parsed.message);
      throw e;
    }
  };

  const logout = async () => {
    const tokens = getStoredTokens();
    if (tokens?.refreshToken) {
      await logoutAction(tokens.refreshToken);
    }
    clearStoredTokens();
    setUser(null);
  };

  const accessTokenGetter = useCallback(() => getStoredTokens()?.accessToken ?? null, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        refreshSession,
        getAccessToken: accessTokenGetter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { ApiError, parseActionError };
