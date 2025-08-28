"use client";

import { deleteProductFile, uploadProductFile } from "@/actions/file-upload";
import { ProductDetail, ProductFile } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, X, Youtube } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type FileWithPreview = File & { preview: string; id?: string };

export default function EditProductMedia({
  product,
  onSave,
  onCancel,
}: {
  product: ProductDetail;
  onSave: (data: { files: ProductFile[]; youtubeUrl?: string; pdf?: ProductFile }) => void;
  onCancel: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [existingImages, setExistingImages] = useState<ProductFile[]>(
    product.product_files?.filter((file) => file.file_type === "image") || []
  );
  const [existingPdf, setExistingPdf] = useState<ProductFile | null>(
    product.product_files?.find((file) => file.file_type === "pdf") || null
  );
  const [youtubeUrl, setYoutubeUrl] = useState(product.youtube_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        ...file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (file: ProductFile) => {
    try {
      setIsLoading(true);
      const { error } = await deleteProductFile(file.id);
      if (error) throw new Error(error);

      setExistingImages((prev) => prev.filter((f) => f.id !== file.id));

      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    } finally {
      setIsLoading(false);
    }
  };

  const removePdf = async () => {
    try {
      setIsLoading(true);
      if (!existingPdf) return;
      const { error } = await deleteProductFile(existingPdf.id);
      if (error) throw new Error(error);

      setExistingPdf(null);

      toast.success("PDF removed successfully");
    } catch (error) {
      console.error("Error removing PDF:", error);
      toast.error("Failed to remove PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const newFiles: ProductFile[] = [];
      const errors: string[] = [];

      // Upload new images
      for (const file of files) {
        try {
          const result = await uploadProductFile(product.id, file, "image");
          if (result.data && !Array.isArray(result.data)) {
            const completeFile: ProductFile = {
              ...result.data,
              alt_text: null,
              display_order: 0,
              is_primary: false,
            };
            newFiles.push(completeFile);
          } else if (result.error) {
            errors.push(`Failed to upload ${file.name}: ${result.error}`);
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          errors.push(`Failed to upload ${file.name}`);
        }
      }

      // Handle PDF upload if any
      let pdfFile = existingPdf;
      const pdfInput = document.querySelector('input[type="file"][accept="application/pdf"]') as HTMLInputElement;
      if (pdfInput?.files?.length) {
        try {
          const file = pdfInput.files[0];
          if (file.size > MAX_FILE_SIZE) {
            errors.push('PDF file is too large. Maximum size is 5MB.');
          } else {
            const result = await uploadProductFile(product.id, file, "pdf");
            if (result.data && !Array.isArray(result.data)) {
              pdfFile = {
                ...result.data,
                alt_text: null,
                display_order: 0,
                is_primary: false,
              };
            } else if (result.error) {
              errors.push(`Failed to upload PDF: ${result.error}`);
            }
          }
        } catch (error) {
          console.error('Error uploading PDF:', error);
          errors.push('Failed to upload PDF');
        }
      }

      // Delete old files that were marked for removal
      if (filesToDelete.length > 0) {
        try {
          await Promise.all(
            filesToDelete.map(fileId => deleteProductFile(fileId))
          );
        } catch (error) {
          console.error('Error deleting files:', error);
          // Continue even if deletion fails
        }
      }

      // Show any errors that occurred during uploads
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
      }

      // Combine existing and new files, excluding those marked for deletion
      const allFiles = [
        ...existingImages.filter(f => !filesToDelete.includes(f.id)),
        ...newFiles
      ];

      // Call parent's onSave with updated files
      onSave({ 
        files: allFiles, 
        youtubeUrl: youtubeUrl.trim() || undefined,
        pdf: pdfFile || undefined
      });
      
      if (errors.length === 0) {
        toast.success("Media updated successfully");
      }
    } catch (error) {
      console.error("Error updating media:", error);
      toast.error("Failed to update media");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Product Images</h4>
          <span className="text-sm text-muted-foreground">
            {existingImages.length + files.length} of {MAX_IMAGES} images
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Existing Images */}
          {existingImages.map((file) => (
            <div key={file.id} className="relative group">
              <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                <Image
                  src={file.url}
                  alt={file.alt_text || 'Product image'}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <button
                type="button"
                onClick={() => removeExistingImage(file)}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* New Files */}
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                <Image
                  src={file.preview}
                  alt={`New image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Add Image Button */}
          {existingImages.length + files.length < MAX_IMAGES && (
            <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/20 transition-colors">
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading || existingImages.length + files.length >= MAX_IMAGES}
              />
              <Plus className="h-6 w-6 text-muted-foreground" />
            </label>
          )}
        </div>
      </div>

      {/* PDF Section */}
      <div className="space-y-2">
        <h4 className="font-medium">Product Catalog (PDF)</h4>
        {existingPdf ? (
          <div className="flex items-center gap-2">
            <a
              href={existingPdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View PDF Catalog
            </a>
            <button
              type="button"
              onClick={removePdf}
              className="text-destructive hover:text-destructive/80"
              disabled={isLoading || isPdfUploading}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="inline-flex items-center gap-2 p-3 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/20 transition-colors">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={async (e) => {
                if (!e.target.files?.length) return;
                const file = e.target.files[0];
                
                if (file.size > MAX_FILE_SIZE) {
                  toast.error('PDF file is too large. Maximum size is 5MB.');
                  return;
                }

                try {
                  setIsPdfUploading(true);
                  const result = await uploadProductFile(product.id, file, "pdf");
                  
                  if (result.data && !Array.isArray(result.data)) {
                    setExistingPdf({
                      ...result.data,
                      alt_text: null,
                      display_order: 0,
                      is_primary: false,
                    });
                  } else if (result.error) {
                    throw new Error(result.error);
                  }
                } catch (error) {
                  console.error("Error uploading PDF:", error);
                  toast.error("Failed to upload PDF");
                } finally {
                  setIsPdfUploading(false);
                  // Reset the input
                  e.target.value = '';
                }
              }}
              disabled={isLoading || isPdfUploading}
            />
            <Plus className="h-4 w-4" />
            <span>Upload PDF Catalog</span>
            {isPdfUploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </label>
        )}
      </div>

      {/* YouTube Section */}
      <div className="space-y-2">
        <h4 className="font-medium">YouTube Video URL</h4>
        <div className="flex items-center gap-2">
          <Input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1"
            disabled={isLoading}
          />
          <Youtube className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || (files.length === 0 && filesToDelete.length === 0 && !youtubeUrl && !existingPdf)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
