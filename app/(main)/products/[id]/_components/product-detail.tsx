"use client";

import { ProductDetail, updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { EditProductDetails } from "./edit-product-details";

export default function ProductDetails({
  product: initialProduct,
}: {
  product: ProductDetail;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialProduct);

  // Helper function to parse specifications with proper TypeScript types
  type SpecificationRecord = Record<string, string>;
  
  const parseSpecifications = useCallback((specs: unknown): SpecificationRecord | null => {
    if (!specs) return null;
    
    // If it's already an object with string values, return as is
    if (typeof specs === 'object' && specs !== null && !Array.isArray(specs)) {
      // Verify all values are strings
      const isValid = Object.values(specs).every(v => typeof v === 'string');
      return isValid ? specs as SpecificationRecord : null;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof specs === 'string') {
      try {
        const parsed = JSON.parse(specs);
        
        // Handle array format: [{key: string, value: string}]
        if (Array.isArray(parsed)) {
          return parsed.reduce<SpecificationRecord>((acc, item) => {
            if (item && typeof item === 'object' && 'key' in item && 'value' in item) {
              const key = String(item.key);
              const value = String(item.value);
              if (key && value) {
                acc[key] = value;
              }
            }
            return acc;
          }, {});
        }
        
        // Handle direct object format
        if (parsed && typeof parsed === 'object') {
          return Object.entries(parsed).reduce<SpecificationRecord>((acc, [key, value]) => {
            if (key && value !== undefined && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          }, {});
        }
        
        // If it's a single value, treat it as the value with a default key
        return { 'Specifications': String(parsed) };
      } catch (e) {
        console.error('Failed to parse specifications:', e);
        // If parsing fails, return as a simple key-value with 'Specifications' as key
        return { 'Specifications': specs };
      }
    }
    
    return null;
  }, []);

  // Memoize the parsed specifications
  const specifications = useMemo(() => 
    parseSpecifications(currentProduct.specifications),
    [currentProduct.specifications, parseSpecifications]
  );

  const handleSave = async (data: {
    description: string;
    specifications: Record<string, string>;
  }) => {
    try {
      setIsLoading(true);
      
      const { success, error } = await updateProduct(currentProduct.id, {
        description: data.description,
        specifications: data.specifications,
      });

      if (success) {
        toast.success("Product updated successfully");
        setCurrentProduct({
          ...currentProduct,
          description: data.description,
          specifications: data.specifications,
        });
        setIsEditing(false);
      } else {
        throw new Error(error || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle>Details</CardTitle>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <EditProductDetails
            initialDescription={currentProduct.description || ""}
            initialSpecifications={
              currentProduct.specifications || {}
            }
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            isLoading={isLoading}
          />
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              {currentProduct.description ? (
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentProduct.description }}
                />
              ) : (
                <p className="text-slate-500 italic">No description available.</p>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-4">Specifications</h4>
              {specifications && Object.keys(specifications).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex">
                      <p className="font-medium text-sm w-1/3">{key}:</p>
                      <p className="text-sm text-muted-foreground flex-1">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No specifications available.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
