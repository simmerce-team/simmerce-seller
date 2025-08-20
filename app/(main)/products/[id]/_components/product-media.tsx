"use client";

import { ProductDetail } from "@/actions/products";
import { Images } from "@/utils/constant";
import Image from "next/image";
import { useState } from "react";

export default function ProductMedia({ product }: { product: ProductDetail }) {
  const [mainImage, setMainImage] = useState(
    product.product_files?.filter((file) => file.is_primary)[0]?.url
  );

  // Extract YouTube video ID from URL if it exists
  const getYoutubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = product.youtube_url
    ? getYoutubeId(product.youtube_url)
    : null;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnails - Vertical on desktop, horizontal on mobile */}
      {product.product_files && product.product_files.length > 0 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {product.product_files.map((file) => (
            <button
              key={file.id}
              className={`flex-shrink-0 relative w-16 h-16 rounded-md overflow-hidden border-2 ${
                mainImage === file.url ? "border-primary" : "border-transparent"
              } hover:border-primary/50 transition-colors`}
              onClick={() => setMainImage(file.url)}
            >
              <Image
                src={file.url}
                alt={`${product.name} - Thumbnail`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}

          {youtubeId && (
            <div className="relative w-16 h-16 aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                title={`${product.name} - YouTube Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}

          {product.pdf_url && (
            <div className="w-16 h-16 border rounded-lg overflow-hidden grid place-items-center">
              <a
                href={product.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={Images.pdf}
                  title={`${product.name} - Product Catalog`}
                  className="w-8 h-8"
                  loading="lazy"
                />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Main Image */}
      <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span>No image available</span>
          </div>
        )}
      </div>
    </div>
  );
}
