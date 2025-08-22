import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BusinessType {
  id: string;
  name: string;
  description: string | null;
}

interface BusinessInfoStepProps {
  formData: {
    businessName: string;
    businessTypeId: string;
    gstNumber: string;
  };
  businessTypes: BusinessType[];
  isLoadingBusinessTypes: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  isSubmitting: boolean;
  isPending: boolean;
}

export function BusinessInfoStep({
  formData,
  businessTypes,
  isLoadingBusinessTypes,
  handleChange,
  handleSelectChange,
  isSubmitting,
  isPending,
}: BusinessInfoStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Business Information</h3>

      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          name="businessName"
          placeholder="Acme Inc."
          value={formData.businessName}
          onChange={handleChange}
          disabled={isPending || isSubmitting}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessTypeId">Business Type</Label>
        <Select
          value={formData.businessTypeId}
          onValueChange={(value) => handleSelectChange("businessTypeId", value)}
          disabled={isPending || isSubmitting || isLoadingBusinessTypes}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
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
        <Label htmlFor="gstNumber">GST Number (Optional)</Label>
        <Input
          id="gstNumber"
          name="gstNumber"
          placeholder="22AAAAA0000A1Z5"
          value={formData.gstNumber}
          onChange={handleChange}
          disabled={isPending || isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          You can add this later in your account settings
        </p>
      </div>
    </div>
  );
}
