'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const businessTypes = [
  'Manufacturer',
  'Wholesaler',
  'Distributor',
  'Retailer',
  'Service Provider',
  'Other',
];

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Account Information
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Business Information
    businessName: '',
    businessType: '',
    phone: '',
    gstin: '',
    
    // Step 3: Additional Details
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      nextStep();
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Implement actual signup logic with your auth provider
      console.log('Signup attempt with:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to verification/setup page
      router.push('/auth/verify-email');
      
      toast('Account created successfully!', {
        description: 'Please verify your email to continue.',
      });
    } catch (error) {
      console.error('Signup error:', error);
      toast('Signup failed', {
        description: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepOne = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Business Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@yourbusiness.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
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
          type="password"
          placeholder="••••••••"
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
          placeholder="Your Business Name"
          value={formData.businessName}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type</Label>
        <Select 
          value={formData.businessType} 
          onValueChange={(value) => handleSelectChange('businessType', value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Business Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91 XXXXXXXXXX"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="gstin">GSTIN (Optional)</Label>
        <Input
          id="gstin"
          name="gstin"
          placeholder="22AAAAA0000A1Z5"
          value={formData.gstin}
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

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Create your seller account';
      case 2: return 'Business Information';
      case 3: return 'Business Address';
      default: return 'Create Account';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Enter your email and create a password to get started';
      case 2: return 'Tell us about your business';
      case 3: return 'Where is your business located?';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {getStepDescription()}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && renderStepOne()}
            {step === 2 && renderStepTwo()}
            {step === 3 && renderStepThree()}
            
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1 || isLoading}
              >
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {step === 3 ? 'Creating Account...' : 'Continue'}
                  </>
                ) : (
                  step === 3 ? 'Create Account' : 'Continue'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col items-center justify-center space-y-4 border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}