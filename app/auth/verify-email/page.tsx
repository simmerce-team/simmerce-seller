'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  // Handle the resend timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else {
      setCanResend(true);
    }
    
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      toast('Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Implement actual verification logic with your backend
      console.log('Verifying code:', verificationCode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On successful verification
      setIsVerified(true);
      toast('Email verified successfully!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Verification error:', error);
      toast('Verification failed', {
        description: error instanceof Error ? error.message : 'Invalid or expired verification code.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    
    try {
      // TODO: Implement resend verification code logic
      console.log('Resending verification code to:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset the resend timer
      setResendTimer(30);
      setCanResend(false);
      
      toast('Verification code sent!', {
        description: 'Please check your email for the new code.',
      });
      
    } catch (error) {
      console.error('Resend error:', error);
      toast('Failed to resend code', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col items-center justify-center space-y-6 sm:w-[400px]">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <MailCheck className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Email Verified!
            </h1>
            <p className="text-sm text-slate-600 mb-8">
              Your email has been successfully verified. Redirecting you to your dashboard...
            </p>
            <Button variant="link" onClick={() => router.push('/dashboard')}>
              Go to Dashboard Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-slate-600">
            We've sent a 6-digit verification code to <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <div className="grid gap-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Verification Code</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setVerificationCode(value.slice(0, 6));
                  }}
                  className="text-center text-xl tracking-widest h-14"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">
                Enter the 6-digit code sent to your email
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify Email
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <p className="text-slate-600">
              Didn't receive a code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={!canResend || isLoading}
                className={`font-medium ${
                  canResend ? 'text-red-600 hover:underline' : 'text-slate-400'
                }`}
              >
                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
              </button>
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>
          
          <div className="text-center text-sm">
            <p className="text-slate-600">
              Need to change your email?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-red-600 hover:underline underline-offset-4"
              >
                Sign up with a different email
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
