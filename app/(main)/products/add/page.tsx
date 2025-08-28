"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/use-categories";
import { UNITS } from "@/utils/constant";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  unit: string;
  moq: string;
  stock_quantity: string;
  category_id: string;
  sku: string;
  is_active: boolean;
}

export default function AddProductPage() {
  const router = useRouter();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "0.00",
    unit: "piece",
    moq: "1",
    stock_quantity: "1",
    category_id: "",
    sku: "",
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});

  // Handle input changes
  const handleInputChange = (
    field: keyof ProductFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.unit.trim()) {
      newErrors.unit = "Unit is required";
    }

    if (!formData.moq || parseInt(formData.moq) <= 0) {
      newErrors.moq = "Valid MOQ is required";
    }

    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = "Valid stock quantity is required";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createProduct({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        unit: formData.unit,
        moq: parseInt(formData.moq, 10) || 1,
        stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
        category_id: formData.category_id,
        sku: formData.sku.trim() || undefined,
        is_active: formData.is_active,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create product");
      }

      toast.success("Product created successfully!");

      // Redirect to products list after a short delay to show success message
      setTimeout(() => {
        router.push("/products");
      }, 1000);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create product. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-bold">Add Product</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter product name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          {/* Price, Unit, MOQ - First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleInputChange("unit", value)}
              >
                <SelectTrigger
                  className={
                    errors.unit ? "border-destructive w-full" : "w-full"
                  }
                >
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem value={unit.value}>{unit.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-destructive">{errors.unit}</p>
              )}
            </div>

            {/* MOQ */}
            <div className="space-y-2">
              <Label htmlFor="moq">Minimum Order Qty *</Label>
              <Input
                id="moq"
                type="number"
                min="1"
                value={formData.moq}
                onChange={(e) => handleInputChange("moq", e.target.value)}
                placeholder="1"
                className={errors.moq ? "border-destructive" : ""}
              />
              {errors.moq && (
                <p className="text-sm text-destructive">{errors.moq}</p>
              )}
            </div>
          </div>

          {/* Stock, Category, SKU - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) =>
                  handleInputChange("stock_quantity", e.target.value)
                }
                placeholder="0"
                className={errors.stock_quantity ? "border-destructive" : ""}
              />
              {errors.stock_quantity && (
                <p className="text-sm text-destructive">
                  {errors.stock_quantity}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  handleInputChange("category_id", value)
                }
                disabled={categoriesLoading}
              >
                <SelectTrigger
                  className={
                    errors.category_id ? "border-destructive w-full" : "w-full"
                  }
                >
                  <SelectValue
                    placeholder={
                      categoriesLoading ? "Loading..." : "Select category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-destructive">{errors.category_id}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Optional)</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="Enter product SKU"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                handleInputChange("is_active", checked)
              }
            />
            <Label htmlFor="is_active">Active Product</Label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>Create Product</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
