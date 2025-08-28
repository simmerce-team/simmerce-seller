"use client";

import { ProductDetail, updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditProductHeader } from "./edit-product-header";

export default function ProductHeader({
  product: initialProduct,
}: {
  product: ProductDetail;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialProduct);

  const handleSave = async (data: {
    name: string;
    sku: string;
    is_active: boolean;
    price: number;
    unit: string;
    moq: number;
    stock_quantity: number;
  }) => {
    try {
      setIsLoading(true);

      const { success, error } = await updateProduct(currentProduct.id, data);

      if (success) {
        toast.success("Product updated successfully");
        setCurrentProduct({
          ...currentProduct,
          ...data,
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
          <CardTitle>Product Information</CardTitle>
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
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="h-8"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <EditProductHeader
            initialData={{
              name: currentProduct.name,
              sku: currentProduct.sku || "",
              is_active: currentProduct.is_active ?? true,
              price: currentProduct.price,
              unit: currentProduct.unit,
              moq: currentProduct.moq,
              stock_quantity: currentProduct.stock_quantity,
            }}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            isLoading={isLoading}
          />
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-2">
                {currentProduct.name}
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {currentProduct.sku ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                    <span className="font-medium">SKU:</span>
                    <span className="tabular-nums">{currentProduct.sku}</span>
                  </span>
                ) : null}
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                    currentProduct.is_active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {currentProduct.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Price</span>
                <span className="font-medium">
                  ₹{currentProduct.price?.toLocaleString("en-IN") ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Unit</span>
                <span className="font-medium">
                  {currentProduct.unit ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">MOQ</span>
                <span className="font-medium">
                  {currentProduct.moq ?? "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Stock</span>
                <span className="font-medium">
                  {currentProduct.stock_quantity?.toLocaleString() ?? "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
