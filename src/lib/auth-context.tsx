'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'customer' | 'tenant_staff' | 'tenant_admin' | 'super_admin';
  tenant_id: string;
  email_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  /** true if a user is present and session is valid */
  isAuthenticated: boolean;
  /** convenience current role (null if not logged in) */
  role: AuthUser['role'] | null;
  /** convenience current tenant id (null if not logged in) */
  tenantId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: { firstName: string; lastName: string; phone?: string; role?: 'customer' | 'tenant_admin' }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  role: null,
  tenantId: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async (authUser: User): Promise<AuthUser | null> => {
    if (!supabase) return null;

    try {
      console.log('Fetching user data for auth user:', authUser.id);
      
      // Don't filter by tenant_id during auth - get user data first, then handle context
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('User data fetch error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          userId: authUser.id,
          fullError: error
        });
        return null;
      }

      if (!data) {
        console.error('No user data found for auth user:', authUser.id);
        return null;
      }

      console.log('Successfully fetched user data:', {
        id: data.id,
        email: data.email,
        role: data.role,
        tenant_id: data.tenant_id
      });

      return {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role,
        tenant_id: data.tenant_id,
        email_verified: data.email_verified,
        created_at: data.created_at,
      };
    } catch (err) {
      console.error('Exception fetching user data:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        userId: authUser.id,
        stack: err instanceof Error ? err.stack : undefined
      });
      return null;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Authentication service is not configured');
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Login failed');
    }

    // Get user data (we'll handle tenant context elsewhere)
    const userData = await fetchUserData(authData.user);
    if (!userData) {
      throw new Error('User account not found');
    }

    // The user and session will be set by the auth state change listener
  }, [fetchUserData]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    userData: { firstName: string; lastName: string; phone?: string; role?: 'customer' | 'tenant_admin' }
  ) => {
    if (!supabase) {
      throw new Error('Authentication service is not configured');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Sign up failed');
    }

    // Create user record in our users table
    const { error: profileError } = await supabase.from('users').insert([
      {
        id: authData.user.id,
        email: authData.user.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        role: userData.role || 'customer',
        tenant_id: null, // This will be set based on registration flow
        email_verified: false,
      },
    ]);

    if (profileError) {
      throw profileError;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new Error('Authentication service is not configured');
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      throw new Error('Authentication service is not configured');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        const userData = await fetchUserData(session.user);
        setUser(userData);
      }
      
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const userData = await fetchUserData(session.user);
          setUser(userData);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    role: user?.role || null,
    tenantId: user?.tenant_id || null,
    signIn,
    signUp,
    signOut,
    resetPassword,
  } as const;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 