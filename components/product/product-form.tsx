'use client';

import { ProductFile } from '@/actions/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MAX_IMAGES, MAX_IMAGE_SIZE, MAX_PDF_SIZE, MAX_TOTAL_SIZE, UNITS } from '@/utils/constant';
import { formatFileSize } from '@/utils/func';
import { FileText, Upload, X, Youtube } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState as useReactState, useRef, useState } from 'react';
import Editor from 'react-simple-wysiwyg';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  unit: string;
  moq: number;
  stock_quantity: number;
  category_id: string;
  is_active: boolean;
  youtube_url: string;
  files: File[];
  existingFiles: ProductFile[];
  pdfFile: File | null;
  existingPdf: string | null;
  sku: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: Category[];
  isPending: boolean;
  onSubmit: (data: Omit<ProductFormData, 'files' | 'pdfFile'> & { 
    files: File[]; 
    pdfFile: File | null;
    deletedFileIds: string[];
  }) => Promise<void>;
  onFilesChange?: (files: File[]) => void;
  onPdfChange?: (file: File | null) => void;
  previewImages?: string[];
  previewPdf?: string | null;
  isEdit?: boolean;
}

type FormStep = 'info' | 'media' | 'review';

const STEPS: { id: FormStep; title: string; description: string }[] = [
  { 
    id: 'info', 
    title: 'Product Details',
    description: 'Fill in the basic information about your product'
  },
  { 
    id: 'media', 
    title: 'Media & Files',
    description: 'Upload images and documents for your product'
  },
  { 
    id: 'review', 
    title: 'Review & Publish',
    description: 'Verify all details before publishing your product'
  },
];

export function ProductForm({
  initialData,
  categories,
  isPending,
  onSubmit,
  onFilesChange,
  onPdfChange,
  isEdit = false,
}: ProductFormProps) {
  const [formData, setFormData] = useReactState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    unit: 'pcs',
    moq: 1,
    stock_quantity: 1,
    category_id: '',
    is_active: true,
    youtube_url: '',
    files: [],
    existingFiles: [],
    pdfFile: null,
    existingPdf: null,
    sku: '',
    ...initialData,
  });

  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<FormStep>('info');
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);

  useEffect(() => {
    if (initialData?.existingFiles) {
      // Find the existing PDF file if any
      const existingPdfFile = initialData.existingFiles.find(f => f.file_type === 'pdf');
      
      setFormData(prev => ({
        ...prev,
        existingFiles: initialData.existingFiles || [],
        // Set existingPdf if we found a PDF file
        ...(existingPdfFile && { existingPdf: existingPdfFile.url })
      }));
    }
  }, [initialData?.existingFiles]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value
    }));
  };

  const handleSwitchChange = (name: 'is_active', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleDescriptionChange = (e: { target: { value: string } }) => {
    setFormData(prev => ({
      ...prev,
      description: e.target.value
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newFiles = Array.from(e.target.files);
    const validFiles: File[] = [];
    let hasError = false;
    let totalSize = [...formData.files, ...formData.existingFiles].reduce(
      (acc, file) => acc + ('size' in file ? file.size : 0),
      0
    );

    // Check total number of images
    const totalImages = formData.existingFiles.filter(f => f.file_type === 'image').length + 
                       formData.files.length + newFiles.length;
    
    if (totalImages > MAX_IMAGES) {
      toast.error(`Maximum of ${MAX_IMAGES} images allowed per product.`);
      return;
    }

    // Validate each file
    for (const file of newFiles) {
      totalSize += file.size;
      
      if (totalSize > MAX_TOTAL_SIZE) {
        toast.error(`Total file size should not exceed ${MAX_TOTAL_SIZE / (1024 * 1024)}MB`);
        hasError = true;
        break;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image.`);
        hasError = true;
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`Image ${file.name} is too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`);
        hasError = true;
        continue;
      }

      validFiles.push(file);
    }

    if (hasError && validFiles.length === 0) return;

    const updatedFiles = [...formData.files, ...validFiles];
    setFormData(prev => ({
      ...prev,
      files: updatedFiles
    }));

    if (onFilesChange) {
      onFilesChange(updatedFiles);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePdfUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    let totalSize = [...formData.files, ...formData.existingFiles].reduce(
      (acc, f) => acc + ('size' in f ? f.size : 0),
      0
    );
    totalSize += file.size;

    if (totalSize > MAX_TOTAL_SIZE) {
      toast.error(`Total file size should not exceed ${MAX_TOTAL_SIZE / (1024 * 1024)}MB`);
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file.');
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      toast.error(`PDF size should be less than ${MAX_PDF_SIZE / (1024 * 1024)}MB`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      pdfFile: file
    }));

    if (onPdfChange) {
      onPdfChange(file);
    }

    // Reset file input
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updatedFiles = [...formData.files];
    updatedFiles.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      files: updatedFiles
    }));
    if (onFilesChange) onFilesChange(updatedFiles);
  };

  const removeExistingImage = (id: string) => {
    const fileToRemove = formData.existingFiles.find(f => f.id === id);
    if (!fileToRemove) return;

    setFormData(prev => ({
      ...prev,
      existingFiles: prev.existingFiles.filter(f => f.id !== id)
    }));

    setDeletedFileIds(prev => [...prev, id]);
  };

  const removePdf = () => {
    if (formData.existingPdf) {
      setDeletedFileIds(prev => [...prev, formData.existingPdf!]);
    }
    
    setFormData(prev => ({
      ...prev,
      pdfFile: null,
      existingPdf: null
    }));

    if (onPdfChange) onPdfChange(null);
  };

  const canSubmit = () => {
    // Basic validation
    if (!formData.name.trim()) return false;
    if (formData.price <= 0) return false;
    if (formData.moq <= 0) return false;
    if (formData.stock_quantity < 0) return false;
    
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        deletedFileIds,
        // Add any other necessary data transformations
      };
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    }
  };

  const allImages = [
    ...formData.existingFiles.filter(f => f.file_type === 'image'),
    ...formData.files.map((file, index) => ({
      id: `new-${index}`,
      url: URL.createObjectURL(file),
      file_type: 'image' as const,
      is_primary: index === 0 && formData.existingFiles.every(f => !f.is_primary)
    }))
  ];


  const renderStepContent = () => {
    switch (currentStep) {
      case 'info':
        return (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-base font-medium text-gray-900">Basic Information</h3>
                <p className="text-sm text-gray-500">Enter the basic details about your product</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Premium Cotton T-Shirt"
                    className="w-full"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <div className="border rounded-md overflow-hidden">
                    <Editor
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      containerProps={{ style: { minHeight: '200px' } }}
                      placeholder="Provide a detailed description of your product..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="youtube_url" className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube Video URL (Optional)
                  </Label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="youtube_url"
                      name="youtube_url"
                      value={formData.youtube_url}
                      onChange={handleInputChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="pl-10 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Category & Pricing */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-base font-medium text-gray-900">Pricing & Inventory</h3>
                <p className="text-sm text-gray-500">Set your product's pricing and stock details</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, category_id: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="pl-8 w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                      Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, unit: value }))
                      }
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="moq" className="block text-sm font-medium text-gray-700">
                      MOQ <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 block font-normal">Minimum Order Qty</span>
                    </Label>
                    <Input
                      id="moq"
                      name="moq"
                      type="number"
                      min="1"
                      value={formData.moq}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
                      Stock Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="stock_quantity"
                      name="stock_quantity"
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU (Optional)
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., PROD-1234"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => handleSwitchChange('is_active', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Make this product active
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'media':
        return (
          <div className="space-y-8">
            {/* Image Upload */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="block text-sm font-medium text-gray-700">
                    Product Images <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-sm text-gray-500">
                    {allImages.length}/{MAX_IMAGES} images
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  First image will be used as the main image. Max {MAX_IMAGE_SIZE / (1024 * 1024)}MB per image.
                </p>
              </div>
              
              {/* Image Grid */}
              <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                {/* Existing images */}
                {allImages.map((file) => (
                  <div key={file.id} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={file.url}
                        alt={`Product ${file.id}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (file.id.startsWith('new-')) {
                          removeImage(Number(file.id.replace('new-', '')));
                        } else {
                          removeExistingImage(file.id);
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add image button */}
                {allImages.length < MAX_IMAGES && (
                  <div 
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 text-center px-2">
                      Add Image
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* PDF Upload */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="space-y-1">
                <Label className="block text-sm font-medium text-gray-700">
                  Product Catalog (PDF)
                </Label>
                <p className="text-sm text-gray-500">
                  Upload a PDF catalog for this product (max {MAX_PDF_SIZE / (1024 * 1024)}MB).
                </p>
              </div>
              
              {formData.pdfFile || formData.existingPdf ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-50 rounded-full">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {formData.pdfFile?.name || 'Product_Catalog.pdf'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formData.pdfFile ? formatFileSize(formData.pdfFile.size) : 'Uploaded'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removePdf}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors bg-gray-50"
                  onClick={() => pdfInputRef.current?.click()}
                >
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white mb-3">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Drag and drop your PDF here, or <span className="text-primary font-medium">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Max size: {MAX_PDF_SIZE / (1024 * 1024)}MB • PDF only
                  </p>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        );

      // ... (review step remains the same)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Stepper */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {STEPS.map((step, stepIdx) => (
              <li key={step.id} className={`${stepIdx !== STEPS.length - 1 ? 'flex-1' : ''} relative`}>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep === step.id 
                        ? 'bg-primary text-white border-2 border-primary' 
                        : completedSteps.includes(step.id) 
                          ? 'bg-green-100 text-green-600 border-2 border-green-600' 
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                    }`}
                  >
                    {completedSteps.includes(step.id) ? (
                      <span className="text-sm">✓</span>
                    ) : (
                      stepIdx + 1
                    )}
                  </button>
                  <span className={`mt-2 text-xs font-medium ${
                    currentStep === step.id ? 'text-primary' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {stepIdx < STEPS.length - 1 && (
                  <div className="absolute top-5 right-0 left-0 -z-10">
                    <div className={`h-0.5 w-full ${
                      completedSteps.includes(step.id) ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {STEPS.find(step => step.id === currentStep)?.title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {STEPS.find(step => step.id === currentStep)?.description}
          </p>
        </div>

        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        {currentStep !== 'info' ? (
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              const currentIndex = STEPS.findIndex(step => step.id === currentStep);
              setCurrentStep(STEPS[Math.max(0, currentIndex - 1)].id);
            }}
            disabled={isPending}
          >
            Back
          </Button>
        ) : (
          <div />
        )}

        {currentStep !== 'review' ? (
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const currentIndex = STEPS.findIndex(step => step.id === currentStep);
              setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
              setCurrentStep(STEPS[Math.min(STEPS.length - 1, currentIndex + 1)].id);
            }}
            disabled={isPending || (currentStep === 'info' && (!formData.name || !formData.description || !formData.category_id))}
          >
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <span className="mr-2">Processing...</span>
              </>
            ) : isEdit ? (
              'Update Product'
            ) : (
              'Create Product'
            )}
          </Button>
        )}
      </div>
    </form>
  );
};



export default ProductForm;
