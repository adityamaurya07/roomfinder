'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

export type UserRole = 'seeker' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isVerified?: boolean;
  city?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrPhone: string, role?: UserRole) => Promise<void>;
  signup: (userData: Omit<User, 'id'>) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  loginWithGmail: (email: string, name?: string, role?: UserRole) => Promise<void>;
  quickDemoLogin: (role: 'seeker' | 'owner') => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (initialMode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'signup';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<'seeker' | 'owner', User> = {
  seeker: {
    id: 'user_demo_seeker_1',
    name: 'Aman Verma',
    email: 'aman.verma@example.com',
    phone: '+91 98765 43210',
    role: 'seeker',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    city: 'Delhi'
  },
  owner: {
    id: 'user_demo_owner_1',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@kirayepe.com',
    phone: '+91 98112 34567',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    city: 'Delhi'
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Load existing session from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('kirayepe_auth_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load user auth session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Synchronize NextAuth session if user logs in through Google OAuth
  useEffect(() => {
    if (session?.user && session.user.email) {
      const gName = session.user.name || session.user.email.split('@')[0];
      const gUser: User = {
        id: (session.user as { id?: string }).id || `google_${session.user.email}`,
        name: gName.charAt(0).toUpperCase() + gName.slice(1),
        email: session.user.email,
        phone: '+91 98100 88990',
        role: 'seeker',
        avatar:
          session.user.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(gName)}`,
        isVerified: true,
        city: 'Delhi'
      };

      setUser(gUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kirayepe_auth_user', JSON.stringify(gUser));
      }
    }
  }, [session]);

  const login = async (emailOrPhone: string, role: UserRole = 'seeker') => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const isEmail = emailOrPhone.includes('@');
    const displayName = isEmail
      ? emailOrPhone.split('@')[0].replace(/[._-]/g, ' ')
      : `User ${emailOrPhone.slice(-4)}`;

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email: isEmail ? emailOrPhone : `${emailOrPhone.replace(/\D/g, '')}@kirayepe.com`,
      phone: isEmail ? '+91 98100 12345' : emailOrPhone,
      role: role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
      isVerified: true,
      city: 'Delhi'
    };

    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kirayepe_auth_user', JSON.stringify(newUser));
    }
    setIsLoading(false);
    setIsAuthModalOpen(false);
  };

  const signup = async (userData: Omit<User, 'id'>) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      isVerified: true,
      avatar:
        userData.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`
    };

    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kirayepe_auth_user', JSON.stringify(newUser));
    }
    setIsLoading(false);
    setIsAuthModalOpen(false);
  };

  const loginWithGoogle = async (role: UserRole = 'seeker') => {
    setIsLoading(true);
    try {
      // Trigger NextAuth Google provider sign in
      const res = await nextAuthSignIn('google', { redirect: false });
      if (res?.error) {
        // Fallback to simulated NextAuth Gmail provider if Google API Keys are not yet set
        await loginWithGmail('aditya.maurya.demo@gmail.com', 'Aditya Maurya', role);
      }
    } catch {
      await loginWithGmail('aditya.maurya.demo@gmail.com', 'Aditya Maurya', role);
    } finally {
      setIsLoading(false);
      setIsAuthModalOpen(false);
    }
  };

  const loginWithGmail = async (email: string, name?: string, role: UserRole = 'seeker') => {
    setIsLoading(true);
    const cleanEmail = email.includes('@') ? email : `${email}@gmail.com`;
    const displayName = name || cleanEmail.split('@')[0];
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

    try {
      await nextAuthSignIn('google-instant', {
        email: cleanEmail,
        name: displayName,
        role,
        avatar,
        redirect: false
      });
    } catch {
      // ignore
    }

    const gUser: User = {
      id: `google_${Date.now()}`,
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email: cleanEmail,
      phone: '+91 98100 88990',
      role,
      avatar,
      isVerified: true,
      city: 'Delhi'
    };

    setUser(gUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kirayepe_auth_user', JSON.stringify(gUser));
    }
    setIsLoading(false);
    setIsAuthModalOpen(false);
  };

  const quickDemoLogin = (role: 'seeker' | 'owner') => {
    const demoUser = DEMO_USERS[role];
    setUser(demoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kirayepe_auth_user', JSON.stringify(demoUser));
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kirayepe_auth_user');
    }
    nextAuthSignOut({ redirect: false }).catch(() => {});
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithGmail,
        quickDemoLogin,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
