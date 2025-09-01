"use client";

import { ProductDetail, ProductFile } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Images } from "@/utils/constant";
import { Loader2, Pencil } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EditProductMedia from "./edit-product-media";

export default function ProductMedia({ product: initialProduct }: { product: ProductDetail }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialProduct);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize main image - find primary or use first image
  const [mainImage, setMainImage] = useState<string | null>(
    initialProduct.product_files?.find((file) => file.is_primary)?.url ||
    initialProduct.product_files?.[0]?.url ||
    null
  );

  // Update main image when product files change
  useEffect(() => {
    const primaryImage = currentProduct.product_files?.find(file => file.is_primary)?.url;
    setMainImage(primaryImage || currentProduct.product_files?.[0]?.url || null);
  }, [currentProduct.product_files]);

  // Extract YouTube video ID from URL if it exists
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = currentProduct.youtube_url ? getYoutubeId(currentProduct.youtube_url) : null;
  const pdfFile = currentProduct.product_files?.find(file => file.file_type === 'pdf');
  const imageFiles = currentProduct.product_files?.filter(file => file.file_type === 'image') || [];

  const handleSave = async ({
    files,
    youtubeUrl,
    pdf
  }: {
    files: ProductFile[];
    youtubeUrl?: string;
    pdf?: ProductFile;
  }) => {
    try {
      setIsSaving(true);
      
      // Combine all files (images + pdf if exists)
      const allFiles = [...files];
      if (pdf) {
        allFiles.push(pdf);
      }

      // Update product with new files and YouTube URL
      const updatedProduct = {
        ...currentProduct,
        product_files: allFiles,
        youtube_url: youtubeUrl || null,
      };

      setCurrentProduct(updatedProduct);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating media:", error);
      toast.error("Failed to update media");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Edit Media</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProductMedia
            product={currentProduct}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Media</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-8"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Pencil className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Saving...' : 'Edit'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Thumbnails - Vertical on desktop, horizontal on mobile */}
          {(imageFiles.length > 0 || youtubeId || pdfFile) && (
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {imageFiles.map((file) => (
                <button
                  key={file.id}
                  className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 ${
                    mainImage === file.url ? "border-primary" : "border-transparent"
                  } hover:border-primary/50 transition-colors`}
                  onClick={() => setMainImage(file.url)}
                  disabled={isSaving}
                >
                  <Image
                    src={file.url}
                    alt={file.alt_text || `${currentProduct.name} - Thumbnail`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}

              {youtubeId && (
                <button
                  className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 ${
                    !mainImage ? "border-primary" : "border-transparent"
                  } hover:border-primary/50 transition-colors`}
                  onClick={() => setMainImage('')}
                  disabled={isSaving}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <img
                      src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                      alt={`${currentProduct.name} - YouTube Thumbnail`}
                      className="w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M8 5v14l11-7z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {pdfFile && (
                <a
                  href={pdfFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-shrink-0 w-16 h-16 border-2 rounded-md overflow-hidden flex items-center justify-center ${
                    !mainImage && !youtubeId ? "border-primary" : "border-transparent"
                  } hover:border-primary/50 transition-colors bg-gray-50`}
                >
                  <div className="text-center">
                    <img
                      src={Images.pdf}
                      alt="PDF Icon"
                      className="w-8 h-8 mx-auto mb-1"
                    />
                    <span className="text-xs text-gray-700">PDF</span>
                  </div>
                </a>
              )}
            </div>
          )}

          {/* Main Image/Video/PDF Viewer */}
          <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={currentProduct.name}
                fill
                className="object-cover"
                priority
              />
            ) : youtubeId ? (
              <div className="w-full h-full">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                  title={`${currentProduct.name} - YouTube Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : pdfFile ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <img
                  src={Images.pdf}
                  alt="PDF Icon"
                  className="w-16 h-16 mb-4 opacity-75"
                />
                <p className="text-lg font-medium mb-2">Product Catalog</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Click the PDF icon to view or download the catalog
                </p>
                <a
                  href={pdfFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center justify-center gap-2"
                >
                  <span>Open PDF</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span>No media available</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
