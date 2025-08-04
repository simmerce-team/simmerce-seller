'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  unit: string;
  moq: string;
  stock_quantity: string;
  category_id: string;
  is_active: boolean;
  image: File | null;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Category[];
  isPending: boolean;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onImageChange?: (file: File | null) => void;
  previewImage?: string | null;
  isEdit?: boolean;
}

const UNITS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'g', label: 'Grams' },
  { value: 'l', label: 'Liters' },
  { value: 'ml', label: 'Milliliters' },
  { value: 'm', label: 'Meters' },
  { value: 'cm', label: 'Centimeters' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
  { value: 'set', label: 'Set' },
];

export function ProductForm({
  initialData,
  categories,
  isPending,
  onSubmit,
  onImageChange,
  previewImage,
  isEdit = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    unit: 'pcs',
    moq: '1',
    stock_quantity: '1',
    category_id: '',
    is_active: true,
    image: null,
    ...initialData,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || '') : value
    }));
  };

  const handleSwitchChange = (name: 'is_active', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Image size should be less than 1MB');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onImageChange) {
          onImageChange(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
     <div className="md:flex gap-2 space-y-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            {isEdit ? 'Update your product details' : 'Add a new product to your inventory'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                name="unit"
                value={formData.unit}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                required
              >
                <SelectTrigger>
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
              <Label htmlFor="moq">Minimum Order Quantity (MOQ) *</Label>
              <Input
                id="moq"
                name="moq"
                type="number"
                min="1"
                value={formData.moq}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                name="category_id"
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Product Image</CardTitle>
          <CardDescription>Upload a clear image of your product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 1MB)</p>
                </div>
              )}
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="flex gap-3 pt-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? 'Updating...' : 'Adding...'}
            </>
          ) : isEdit ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}
