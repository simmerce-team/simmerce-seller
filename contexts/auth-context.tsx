'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    // Check active sessions and set the user
    const getSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        setUser(session?.user ?? null);
        
        // Only redirect if we have a session state
        if (!session?.user) {
          // Only redirect to login if we're not already on an auth page
          const isAuthPage = ['/auth', '/auth/login', '/auth/signup', '/auth/reset-password'].some(
            path => pathname.startsWith(path)
          );
          
          if (!isAuthPage) {
            router.push('/auth');
          }
        } else if (['/auth', '/auth/login', '/auth/signup'].includes(pathname)) {
          // If user is logged in and tries to access auth pages, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Handle auth state changes
      if (event === 'SIGNED_IN') {
        // If user just signed in, redirect to dashboard if they're on an auth page
        if (['/auth', '/auth/login', '/auth/signup'].includes(pathname)) {
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        // Only redirect to auth if we're not already on an auth page
        const isAuthPage = ['/auth', '/auth/login', '/auth/signup', '/auth/reset-password'].some(
          path => pathname.startsWith(path)
        );
        
        if (!isAuthPage) {
          router.push('/auth');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    isLoading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
