"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UNITS } from "@/utils/constant";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

type ProductHeaderFields = {
  name: string;
  sku: string;
  is_active: boolean;
  price: number;
  unit: string;
  moq: number;
  stock_quantity: number;
};

interface EditProductHeaderProps {
  initialData: ProductHeaderFields;
  onSave: (data: ProductHeaderFields) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function EditProductHeader({
  initialData,
  onSave,
  onCancel,
  isLoading,
}: EditProductHeaderProps) {
  const [formData, setFormData] = useState<ProductHeaderFields>({
    ...initialData,
    sku: initialData.sku || "",
  });

  const handleChange = (field: keyof ProductHeaderFields, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium leading-none">
          Product Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium leading-none">SKU</label>
          <Input
            value={formData.sku}
            onChange={(e) => handleChange("sku", e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <label className="block text-sm font-medium leading-none">
            Status
          </label>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => handleChange("is_active", checked)}
          />
          <span className="text-sm">
            {formData.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium leading-none">
            Price (₹) <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.price || ""}
            onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium leading-none">
            Unit <span className="text-destructive">*</span>
          </label>
          <Select
            value={formData.unit}
            onValueChange={(value) => handleChange("unit", value)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium leading-none">
            MOQ <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min="1"
            value={formData.moq || ""}
            onChange={(e) => handleChange("moq", parseInt(e.target.value) || 1)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium leading-none">
            Stock Quantity <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            min="0"
            value={formData.stock_quantity || ""}
            onChange={(e) => handleChange("stock_quantity", parseInt(e.target.value) || 0)}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
