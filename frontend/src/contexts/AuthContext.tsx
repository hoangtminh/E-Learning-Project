'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
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
  fullname: string | null;
  fullName?: string | null;
  name?: string;
  imageUrl: string | null | undefined;
  avatar?: string;
  role?: string;
  // Add other user properties here based on your backend response
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  getUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const setMappedUser = (userVal: any) => {
    if (userVal) {
      setUser({
        ...userVal,
        userId: userVal.id || userVal.userId,
        fullname: userVal.fullName || userVal.fullname || null,
        fullName: userVal.fullName || userVal.fullname || null,
      });
    } else {
      setUser(null);
    }
  };

  const logout = () => {
    removeTokenCookie();
    setAuthToken(null);
    setMappedUser(null);
    router.push('/login');
  };

  const getUser = async () => {
    const token = getTokenCookie();
    if (token) {
      setAuthToken(token);
      try {
        const res = await apiGetUser();
        if (res.success && res.data) {
          setMappedUser(res.data);
        } else {
          // Token is stale or invalid on the server side
          removeTokenCookie();
          setAuthToken(null);
          setMappedUser(null);
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to authenticate token with server:', err);
        removeTokenCookie();
        setAuthToken(null);
        setMappedUser(null);
        router.push('/login');
      }
    } else {
      setMappedUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await getUser();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const result = await apiLogin(credentials);
    if (result.success && result.data) {
      setTokenCookie(result.data.accessToken);
      setAuthToken(result.data.accessToken);
      setMappedUser(result?.data?.user);
    } else {
      throw new Error(result.error || 'Login failed');
    }
  };

  const register = async (data: any) => {
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
