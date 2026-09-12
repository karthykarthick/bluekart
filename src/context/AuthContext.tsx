import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../data/seedData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'bluecart_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted user if available, otherwise require login first
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const saveUser = (u: UserProfile | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (!error && data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || email.split('@')[0],
            role: (data.user.user_metadata?.role as UserRole) || (email.includes('admin') ? 'admin' : 'customer'),
            created_at: data.user.created_at,
          };
          saveUser(profile);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Check demo credentials or match local accounts
      if (email.toLowerCase() === DEMO_USERS.admin.email.toLowerCase()) {
        saveUser(DEMO_USERS.admin);
        setIsLoading(false);
        return { success: true };
      }

      if (email.toLowerCase() === DEMO_USERS.customer.email.toLowerCase()) {
        saveUser(DEMO_USERS.customer);
        setIsLoading(false);
        return { success: true };
      }

      // Allow any login with default password for smooth preview/testing
      const newCustomUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
        created_at: new Date().toISOString(),
      };
      saveUser(newCustomUser);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    chosenRole: UserRole = 'customer'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { name, role: chosenRole },
          },
        });
        if (!error && data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            name,
            role: chosenRole,
            created_at: data.user.created_at,
          };
          saveUser(profile);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Local signup
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        name,
        role: chosenRole,
        created_at: new Date().toISOString(),
      };
      saveUser(newUser);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    saveUser(null);
  };

  const loginAsDemo = (targetRole: UserRole) => {
    const demo = DEMO_USERS[targetRole];
    saveUser(demo);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUser(updated);
  };

  const role = user?.role || 'customer';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isLoading,
        login,
        signup,
        logout,
        loginAsDemo,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
