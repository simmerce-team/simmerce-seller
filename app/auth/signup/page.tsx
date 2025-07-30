'use client';

import { signUp } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface BusinessType {
  id: string;
  name: string;
  description: string | null;
}

function SignUpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [isLoadingBusinessTypes, setIsLoadingBusinessTypes] = useState(true);
  const [formData, setFormData] = useState({
    // Step 1: Account Information
    fullName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Step 2: Business Information
    businessName: '',
    businessTypeId: '',
    gstNumber: '',
    
    // Step 3: Additional Details
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  
  // Fetch business types when component mounts
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { data, error } = await supabase
          .from('business_types')
          .select('*')
          .order('name', { ascending: true });


        if (error) {
          console.error('Error fetching business types:', error);
          toast.error('Failed to load business types');
          return;
        }

        setBusinessTypes(data || []);

      } catch (error) {
        console.error('Error in fetchBusinessTypes:', error);
        toast.error('An error occurred while loading business types');
      } finally {
        setIsLoadingBusinessTypes(false);
      }
    };

    fetchBusinessTypes();
  }, []);

  // Log when business types are updated
  useEffect(() => {
    console.log('Business types state updated:', businessTypes);
  }, [businessTypes]);

  // Handle email from query params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // If no email is provided, redirect to the auth page
      router.push('/auth');
    }
  }, [searchParams, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.fullName) {
        toast('Full name is required');
        return false;
      }
      if (!formData.password) {
        toast('Password is required');
        return false;
      }
      if (formData.password.length < 8) {
        toast('Password must be at least 8 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast('Passwords do not match');
        return false;
      }
    } else if (step === 2) {
      if (!formData.businessName) {
        toast('Business name is required');
        return false;
      }
      if (!formData.businessTypeId) {
        toast('Please select a business type');
        return false;
      }
    } else if (step === 3) {
      if (!formData.address) {
        toast('Address is required');
        return false;
      }
      if (!formData.city) {
        toast('City is required');
        return false;
      }
      if (!formData.state) {
        toast('State is required');
        return false;
      }
      if (!formData.pincode) {
        toast('Pincode is required');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      if (!validateStep(step)) {
        return;
      }
      nextStep();
      return;
    }
    
    // Final validation
    if (!validateStep(3)) {
      return;
    }
    
    setIsSubmitting(true);
    
    startTransition(async () => {
      try {
        const result = await signUp({
          email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          businessName: formData.businessName,
          businessTypeId: formData.businessTypeId,
          gstNumber: formData.gstNumber || undefined,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        });

        if (!result.success) {
          throw new Error(result.error || 'Signup failed');
        }
        
        // Redirect to dashboard after successful signup
        router.push('/dashboard');
        
        toast('Account created successfully!', {
          description: 'Welcome to your seller dashboard!',
        });
      } catch (error) {
        console.error('Signup error:', error);
        toast('Signup failed', {
          description: error instanceof Error ? error.message : 'An error occurred. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handleBack = () => {
    if (step === 1) {
      router.push('/auth');
    } else {
      setStep(prev => prev - 1);
    }
  };

  const renderStepOne = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <div className="p-2 border rounded-md bg-gray-50 text-gray-700">
          {email}
        </div>
        <p className="text-sm text-muted-foreground">
          This will be your account email
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="John Doe"
          disabled={isPending || isSubmitting}
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91 9876543210"
          disabled={isPending || isSubmitting}
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Create a Password</Label>
        <Input
          id="password"
          name="password"
          placeholder="••••••••"
          type="password"
          autoComplete="new-password"
          disabled={isPending || isSubmitting}
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          placeholder="••••••••"
          type="password"
          autoComplete="new-password"
          disabled={isPending || isSubmitting}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          name="businessName"
          placeholder="Acme Inc."
          disabled={isPending || isSubmitting}
          value={formData.businessName}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type</Label>
        <Select
          onValueChange={(value) => handleSelectChange('businessTypeId', value)}
          value={formData.businessTypeId}
          disabled={isLoadingBusinessTypes}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              isLoadingBusinessTypes 
                ? 'Loading business types...' 
                : 'Select business type'
            } />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gstNumber">GSTIN (Optional)</Label>
        <Input
          id="gstNumber"
          name="gstNumber"
          placeholder="22AAAAA0000A1Z5"
          disabled={isPending || isSubmitting}
          value={formData.gstNumber}
          onChange={handleChange}
        />
        <p className="text-xs text-muted-foreground">
          You can add this later from your account settings
        </p>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="123 Business Street"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            placeholder="Mumbai"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            placeholder="Maharashtra"
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="pincode">Pincode</Label>
        <Input
          id="pincode"
          name="pincode"
          type="number"
          placeholder="400001"
          value={formData.pincode}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="flex items-start space-x-2 pt-2">
        <div className="flex items-center h-5 mt-0.5">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            required
          />
        </div>
        <label
          htmlFor="terms"
          className="text-sm text-muted-foreground"
        >
          I agree to the{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </label>
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-6">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              step >= stepNumber
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {stepNumber}
          </div>
          {stepNumber < 3 && (
            <div className="w-16 h-0.5 bg-border mx-2"></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 1 && 'Create your account'}
            {step === 2 && 'Business Information'}
            {step === 3 && 'Business Address'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 && `Sign up with ${email}`}
            {step === 2 && 'Tell us about your business'}
            {step === 3 && 'Where is your business located?'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {step > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="px-0 text-muted-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
            
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending || isSubmitting}
            >
              {(isPending || isSubmitting) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : step === 3 ? (
                'Create Account'
              ) : (
                'Continue'
              )}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href={`/auth/login?email=${encodeURIComponent(email)}`} 
                className="text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}