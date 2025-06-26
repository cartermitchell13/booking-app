'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useTenant } from './tenant-context';

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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { firstName: string; lastName: string; phone?: string; role?: 'customer' | 'tenant_admin' }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
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
  const { tenant } = useTenant();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async (authUser: User): Promise<AuthUser | null> => {
    if (!supabase || !tenant?.id) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .eq('tenant_id', tenant.id)
        .single();

      if (error || !data) {
        console.error('User data fetch error:', error);
        return null;
      }

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
      console.error('Error fetching user data:', err);
      return null;
    }
  }, [tenant?.id]);

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

    // Verify user belongs to current tenant
    const userData = await fetchUserData(authData.user);
    if (!userData) {
      await supabase.auth.signOut();
      throw new Error('Account not found for this domain. Please check your email or register for a new account.');
    }
  }, [fetchUserData]);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    userData: { firstName: string; lastName: string; phone?: string; role?: 'customer' | 'tenant_admin' }
  ) => {
    if (!supabase || !tenant?.id) {
      throw new Error('Authentication service is not configured');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          tenant_id: tenant.id
        }
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Registration failed');
    }

    // Create user record in our users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        tenant_id: tenant.id,
        email: email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null,
        role: userData.role || 'customer',
        email_verified: false
      });

    if (userError) {
      console.error('User creation error:', userError);
      // Don't throw here as the auth user was created successfully
    }
  }, [tenant?.id]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
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
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 