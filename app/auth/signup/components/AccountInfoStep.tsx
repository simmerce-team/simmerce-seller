import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '../../shared/components/forms';

interface AccountInfoStepProps {
  formData: {
    fullName: string;
    password: string;
    confirmPassword: string;
    phone: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  isPending: boolean;
}

export function AccountInfoStep({
  formData,
  handleChange,
  isSubmitting,
  isPending,
}: AccountInfoStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Account Information</h3>
      <p className="text-sm text-muted-foreground">
        Create your account to get started
      </p>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          disabled={isPending || isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91 1234567890"
          value={formData.phone}
          onChange={handleChange}
          disabled={isPending || isSubmitting}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Create a Password</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isPending || isSubmitting}
          value={formData.password}
          onChange={handleChange}
          required
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isPending || isSubmitting}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );
}
