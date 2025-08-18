'use client';

import { Product } from "@/actions/show-product";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Images } from "@/utils/constant";
import Image from "next/image";
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from 'react-swipeable';

interface FileType {
  id: string;
  url: string;
  file_type: string;
  name?: string;
}

const getYoutubeEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null;
};

export const ImageArea = ({ product }: { product: Product }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  
  const images = (product?.files?.filter((img) => img.file_type === "image") || []) as FileType[];
  const pdfs = (product?.files?.filter((img) => img.file_type === "pdf") || []) as FileType[];
  const youtubeUrl = product?.youtube_url;
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);
  const videoId = embedUrl?.match(/embed\/([^?]+)/)?.[1];
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  const currentImage = images[selectedImageIndex] || images[0];
  const hasMultipleImages = images.length > 1;
  const totalThumbnails = images.length + pdfs.length + (thumbnailUrl ? 1 : 0);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!hasMultipleImages) return;
    
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    } else if (e.key >= '1' && e.key <= '9' && parseInt(e.key) <= images.length) {
      e.preventDefault();
      setSelectedImageIndex(parseInt(e.key) - 1);
    }
  }, [hasMultipleImages, images.length]);

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (hasMultipleImages) {
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
      }
    },
    onSwipedRight: () => {
      if (hasMultipleImages) {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  // Close dialog on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setShowYoutubeDialog(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Image loading state handlers
  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load image');
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsLoading(true);
    setError(null);
  };

  if (!product) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden aspect-square flex items-center justify-center">
        <div className="text-slate-400">No product data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Main Image */}
      <div 
        className="relative aspect-square bg-gradient-to-br from-slate-50/50 to-slate-100/30"
        {...swipeHandlers}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="region"
        aria-label="Product image gallery"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse bg-slate-200 w-full h-full" />
          </div>
        )}
        
        {error ? (
          <div className="w-full h-full flex items-center justify-center text-red-500 p-4">
            {error}
          </div>
        ) : (
          <Image
            src={currentImage?.url || Images.placeholder}
            alt={product?.name || 'Product image'}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={selectedImageIndex === 0}
            onLoad={handleImageLoad}
            onError={handleImageError}
            aria-live="polite"
            aria-atomic="true"
          />
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 rounded-full p-2 shadow-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) => (prev + 1) % images.length);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 rounded-full p-2 shadow-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Next image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {totalThumbnails > 0 && (
        <div className="m-4 grid grid-cols-4 gap-2 sm:gap-3">
          {images.map((img, index) => (
            <button
              key={`img-${img.id || index}`}
              type="button"
              className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                index === selectedImageIndex 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : 'opacity-80 hover:opacity-100 hover:ring-1 hover:ring-slate-300'
              }`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={index === selectedImageIndex ? 'true' : 'false'}
            >
              <Image
                src={img?.url || Images.placeholder}
                alt={`"${product?.name}" thumbnail ${index + 1}`}
                fill
                sizes="(max-width: 768px) 20vw, 80px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}

          {pdfs.map((file) => (
            <a
              key={`pdf-${file.id}`}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-slate-50 border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors flex items-center justify-center hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`Open PDF: ${file.name || 'Product document'}`}
            >
              <div className="text-center p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-xs mt-1 block text-slate-600">PDF</span>
              </div>
            </a>
          ))}

          {thumbnailUrl && (
            <button
              type="button"
              className="aspect-square bg-slate-50 border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors relative group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => setShowYoutubeDialog(true)}
              aria-label="Play product video"
            >
              <div className="w-full h-full relative">
                <Image
                  src={thumbnailUrl}
                  alt="YouTube video thumbnail"
                  fill
                  className="object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-opacity group-hover:bg-opacity-40">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center transform transition-transform group-hover:scale-110">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* YouTube Dialog */}
      <Dialog open={showYoutubeDialog} onOpenChange={setShowYoutubeDialog}>
        <DialogContent 
          className="max-w-4xl p-0 bg-transparent border-none shadow-none"
          ref={dialogRef}
        >
          <div className="relative w-full aspect-video">
            <button 
              onClick={() => setShowYoutubeDialog(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1"
              aria-label="Close video"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full h-full rounded-lg overflow-hidden">
              <iframe
                src={embedUrl || ''}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${product?.name} video`}
                loading="eager"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
