'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  getUser as apiGetUser,
  setTokenCookie,
  removeTokenCookie,
  getTokenCookie,
} from '@/api/auth';
import { setAuthToken } from '@/api/client';

export interface User {
  userId: string;
  id?: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role?: string;
}

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = LoginCredentials & {
  fullName: string;
};

type AuthUserLike = Partial<User> & {
  fullname?: string | null;
  imageUrl?: string | null;
  avatar?: string | null;
};

type JwtPayload = {
  sub?: string;
  email?: string;
  fullName?: string | null;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  getUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setMappedUser = (userVal: AuthUserLike | null) => {
    if (userVal) {
      setUser({
        ...userVal,
        userId: userVal.id || userVal.userId || "",
        email: userVal.email || "",
        fullName: userVal.fullName || userVal.fullname || null,
        avatarUrl: userVal.avatarUrl || userVal.imageUrl || userVal.avatar || null,
      });
    } else {
      setUser(null);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const logout = () => {
    removeTokenCookie();
    setAuthToken(null);
    setMappedUser(null);
    window.location.href = '/login';
  };

  const getUser = async () => {
    const token = getTokenCookie();
    if (!token) {
      setMappedUser(null);
      return;
    }

    setAuthToken(token);

    const tokenPayload = decodeJwtPayload(token);
    if (!user && tokenPayload?.sub && tokenPayload?.email) {
      setMappedUser({
        id: tokenPayload.sub,
        email: tokenPayload.email,
        fullName: tokenPayload.fullName || null,
      });
    }

    try {
      const res = await apiGetUser();
      if (res.success && res.data) {
        setMappedUser(res.data);
        return;
      }

      if (res.status === 401 || res.status === 403) {
        removeTokenCookie();
        setAuthToken(null);
        setMappedUser(null);
        window.location.href = "/login";
        return;
      }

      console.warn("Could not refresh current user; keeping existing session.", res.error);
    } catch (err) {
      console.error("Failed to refresh current user; keeping existing session:", err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await getUser();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const result = await apiLogin(credentials);
    if (result.success && result.data) {
      setTokenCookie(result.data.accessToken);
      setAuthToken(result.data.accessToken);
      setMappedUser(result?.data?.user);
    } else {
      throw new Error(result.error || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    const result = await apiRegister(data);
    if (result.success && result.data) {
      setTokenCookie(result.data.accessToken);
      setAuthToken(result.data.accessToken);
      setMappedUser(result.data.user);
    } else {
      throw new Error(result.error || 'Registration failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        getUser,
        updateUser,
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
