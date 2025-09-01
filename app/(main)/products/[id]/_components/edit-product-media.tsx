"use client";

import { deleteProductFile, uploadProductFile } from "@/actions/file-upload";
import { ProductDetail, ProductFile } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALLOWED_IMAGE_TYPES, Images, MAX_IMAGES, MAX_PDF_SIZE } from "@/utils/constant";
import { FileText, Loader2, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
          if (file.size > MAX_PDF_SIZE) {
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
      {/* Image Upload Section */}
      <div className="space-y-2">
        <h4 className="font-medium">Product Images</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Existing Images */}
          {existingImages.map((file) => (
            <div key={file.id} className="relative group">
              <div className="aspect-square overflow-hidden rounded-md border">
                <Image
                  src={file.url}
                  alt="Product preview"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeExistingImage(file)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          {/* New Image Uploads */}
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square overflow-hidden rounded-md border">
                <Image
                  src={file.preview}
                  alt="New upload preview"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Add Image Button */}
          {existingImages.length + files.length < MAX_IMAGES && (
            <label className="flex aspect-square items-center justify-center rounded-md border border-dashed cursor-pointer hover:bg-muted/20 transition-colors">
              <input
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={handleFileChange}
                multiple
                disabled={isLoading || isUploading}
              />
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Add Image
                </span>
              </div>
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {existingImages.length + files.length} of {MAX_IMAGES} images
        </p>
      </div>

      {/* PDF Section */}
      <div className="space-y-2">
        <h4 className="font-medium">PDF Catalog</h4>
        {existingPdf ? (
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              <a 
                href={existingPdf.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View PDF
              </a>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removePdf}
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ) : (
          <Input
            type="file"
            accept=".pdf"
            onChange={async (e) => {
              if (e.target.files?.[0]) {
                try {
                  setIsPdfUploading(true);
                  const file = e.target.files[0];
                  const result = await uploadProductFile(product.id, file, 'pdf');
                  if (result.error) throw new Error(result.error);
                  
                  if (result.data) {
                    const uploadedFile = Array.isArray(result.data) ? result.data[0] : result.data;
                    setExistingPdf({
                      ...uploadedFile,
                      file_type: 'pdf' as const,
                      is_primary: false,
                      alt_text: null,
                      display_order: 0,
                    });
                  }
                } catch (error) {
                  console.error('PDF upload error:', error);
                  toast.error('Failed to upload PDF');
                } finally {
                  setIsPdfUploading(false);
                }
              }
            }}
            disabled={isLoading || isPdfUploading}
          />
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
          <Image src={Images.youtube} alt="YouTube thumbnail" width={32} height={32} />
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
