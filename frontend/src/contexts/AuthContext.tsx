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
  refreshTokenApi,
  apiLogout,
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
  rememberMe?: boolean;
};

type RegisterData = LoginCredentials & {
  fullName: string;
};

type AuthUserLike = Partial<User> & {
  fullName?: string | null;
  fullname?: string | null;
  imageUrl?: string | null;
  avatar?: string | null;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  getUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setMappedUser = (userVal: AuthUserLike | null) => {
    if (userVal) {
      setUser({
        ...userVal,
        userId: userVal.id || userVal.userId || '',
        email: userVal.email || '',
        fullName: userVal.fullName || userVal.fullname || null,
        avatarUrl: userVal.avatarUrl || userVal.avatar || userVal.imageUrl || null,
      });
    } else {
      setUser(null);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  /**
   * Clears local state and asks the backend to revoke the refresh token.
   * The backend also clears the HttpOnly cookie via Set-Cookie.
   */
  const logout = async () => {
    setAuthToken(null);
    setMappedUser(null);
    await apiLogout(); // Revoke DB token + clear httpOnly cookie
    window.location.href = '/login';
  };

  const getUser = async () => {
    const res = await apiGetUser();

    if (res.success && res.data) {
      setMappedUser(res.data);
      return;
    }

    if (res.status === 401 || res.status === 403) {
      // Access token missing/expired — try silent refresh
      const refreshed = await refreshTokenApi();
      if (refreshed?.accessToken) {
        setAuthToken(refreshed.accessToken);
        const retryRes = await apiGetUser();
        if (retryRes.success && retryRes.data) {
          setMappedUser(retryRes.data);
          return;
        }
      }

      // Refresh also failed — user must log in again
      setAuthToken(null);
      setMappedUser(null);
      return;
    }

    console.warn('Could not fetch current user; keeping existing session.', res.error);
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
      // Store access token in memory only
      setAuthToken(result.data.accessToken);
      setMappedUser(result.data.user);
    } else {
      throw new Error(result.error || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    const result = await apiRegister(data);
    if (result.success && result.data) {
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
