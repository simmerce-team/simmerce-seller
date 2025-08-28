'use client';

import { login } from '@/actions/auth';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailRegex = useMemo(() => /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, []);
  const isPasswordValid = useMemo(() => password.length >= 8, [password]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      const normalized = decodeURIComponent(emailParam).trim().toLowerCase();
      if (!emailRegex.test(normalized)) {
        router.push('/auth');
        return;
      }
      setEmail(normalized);
    } else {
      // If no email is provided, redirect to the auth page
      router.push('/auth');
    }
  }, [searchParams, router]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    startTransition(async () => {
      try {
        const result = await login(email, password);
        
        if (!result.success) {
          throw new Error(result.error || 'Login failed');
        }
        
        // Redirect to seller dashboard on successful login
        router.push('/dashboard');
        
        toast.success('Login successful');
      } catch (error) {
        console.error('Login error:', error);
        toast.error('Login failed');
      } finally {
        setIsSubmitting(false);
      }
    });
  }, [email, isPasswordValid, login, password, router, startTransition]);
  
  const handleBack = useCallback(() => {
    router.push('/auth');
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Enter your password</CardTitle>
          <CardDescription>
            Sign in to your account with <p className="font-medium text-primary">{email}</p>
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href={`/auth/forgot-password?email=${encodeURIComponent(email)}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={isPending || isSubmitting}
                  autoComplete="current-password"
                  enterKeyHint="done"
                  required
                />
              </div>
           
            </div>
            
            <Button 
              type="submit"
              disabled={isPending || isSubmitting || !isPasswordValid}
              className="w-full"
              onMouseEnter={() => {
                try { router.prefetch('/dashboard'); } catch {}
              }}
            >
              {(isPending || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isPending || isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Not {email}?{' '}
            <button 
              onClick={handleBack}
              className="text-primary hover:underline"
              type="button"
            >
              Use another email
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}