import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, disableMockMode } from '../services/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'PARENT';
  permissions?: string[];
  canteenId?: string | null;
  canteen?: {
    id: string;
    name: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  selectedCanteenId: string; // 'ALL' or specific canteen ID
  setSelectedCanteenId: (id: string) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission?: string) => boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [selectedCanteenId, setSelectedCanteenIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParam = new URLSearchParams(window.location.search).get('canteenId');
      if (urlParam) return urlParam;
      const saved = localStorage.getItem('selectedCanteenId');
      if (saved) return saved;
    }
    return 'ALL';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setSelectedCanteenId = useCallback((id: string) => {
    setSelectedCanteenIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCanteenId', id);
      try {
        const url = new URL(window.location.href);
        if (id && id !== 'ALL') {
          url.searchParams.set('canteenId', id);
        } else {
          url.searchParams.delete('canteenId');
        }
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
      } catch {
        // ignore
      }
    }
  }, []);

  const refreshUserProfile = async () => {
    if (!token) return;
    try {
      const res = await api.get('/users/me');
      if (res.data) {
        setUser((prev) => {
          const updated = { ...(prev || {}), ...res.data };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        if (parsedUser.role !== 'SUPER_ADMIN' && parsedUser.canteenId) {
          setSelectedCanteenId(parsedUser.canteenId);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    // Auto-heal stale canteenId in localStorage
    api.get('/canteens').then((res) => {
      const list = res.data;
      if (Array.isArray(list) && list.length > 0) {
        setSelectedCanteenIdState((currentId) => {
          if (currentId !== 'ALL' && !list.some((c: any) => c.id === currentId)) {
            const fallback = list.length === 1 ? list[0].id : 'ALL';
            if (typeof window !== 'undefined') {
              localStorage.setItem('selectedCanteenId', fallback);
            }
            return fallback;
          }
          return currentId;
        });
      }
    }).catch(() => {});

    setIsLoading(false);
  }, [setSelectedCanteenId]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    if (newUser.role !== 'SUPER_ADMIN' && newUser.canteenId) {
      setSelectedCanteenId(newUser.canteenId);
    } else {
      const urlParam = new URLSearchParams(window.location.search).get('canteenId');
      const saved = localStorage.getItem('selectedCanteenId');
      setSelectedCanteenId(urlParam || saved || 'ALL');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedCanteenId');
    disableMockMode();
    setToken(null);
    setUser(null);
    setSelectedCanteenId('ALL');
  };

  const hasPermission = (permission?: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (!permission) return true;
    if (user.role === 'ADMIN') {
      const userPermissions = user.permissions || [];
      return userPermissions.includes(permission);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        selectedCanteenId,
        setSelectedCanteenId,
        login,
        logout,
        isLoading,
        hasPermission,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
