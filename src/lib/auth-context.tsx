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
  const { tenant } = useTenant();
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
      await supabase.auth.signOut();
      throw new Error('Account not found. Please check your email or contact support.');
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

    // For mock tenant ID, use the real ParkBus tenant ID (same as tenant context logic)
    const actualTenantId = tenant.id === 'mock-parkbus-id' 
      ? '20ee5f83-1019-46c7-9382-05a6f1ded9bf' 
      : tenant.id;

    console.log('SignUp: Using actual tenant ID:', actualTenantId, 'for tenant:', tenant.name);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          tenant_id: actualTenantId
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Registration failed');
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Create user record in our users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        tenant_id: actualTenantId,
        email: email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null,
        role: userData.role || 'customer',
        email_verified: false
      });

    if (userError) {
      console.error('User creation error:', userError);
      // Try to clean up the auth user if our user creation failed
      if (authData.user) {
        console.log('Attempting to clean up auth user due to user table error');
        await supabase.auth.admin.deleteUser(authData.user.id);
      }
      throw new Error(`Failed to create user profile: ${userError.message}`);
    }

    console.log('User profile created successfully in users table');
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