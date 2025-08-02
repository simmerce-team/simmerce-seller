'use client';

import { login } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '../shared/components/forms';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // If no email is provided, redirect to the auth page
      router.push('/auth');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast('Password is required');
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
        
        toast('Login successful', {
          description: 'Welcome back to your seller dashboard!',
        });
      } catch (error) {
        console.error('Login error:', error);
        toast('Login failed', {
          description: error instanceof Error ? error.message : 'An error occurred. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  
  const handleBack = () => {
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <button
            type="button"
            onClick={handleBack}
            className="absolute left-4 top-4 p-1 rounded-full hover:bg-gray-100"
            aria-label="Back to email entry"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <CardTitle className="text-2xl font-bold">Enter your password</CardTitle>
          <CardDescription className="text-gray-500">
            Sign in to your account with {email}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={isPending || isSubmitting}
                  required
                />
              </div>
              <Link
                href={`/auth/forgot-password?email=${encodeURIComponent(email)}`}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button 
              type="submit"
              disabled={isPending || isSubmitting}
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