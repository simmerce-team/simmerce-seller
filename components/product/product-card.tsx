'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

type Product = {
  id: string | number;
  name: string;
  price: number; // Price per unit
  unit: string; // Unit type (piece, kg, meter, etc.)
  minOrderQuantity: number; // Minimum order quantity
  rating?: number; // Product rating
  reviewCount?: number; // Number of reviews
  image: string | StaticImageData;
  isVerified?: boolean;
  category?: string;
  className?: string;
};

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const {
    id,
    name,
    price,
    unit,
    minOrderQuantity,
    rating,
    reviewCount,
    image,
    isVerified = false,
    category,
  } = product;

  const cardContent = (
    <Card className={`p-0 group overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 ${className}`}>
      {/* Image Container - Fixed height to prevent oversized images */}
      <div className="relative h-32 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {typeof image === 'string' ? (
          <img 
            src={image}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Verification badge overlay */}
        {isVerified && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}
        
        {/* Category badge */}
        {category && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-white/90 text-slate-600 border-slate-200 text-xs">
              {category}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          {/* Product Name - Handle overflow with proper truncation */}
          <h3 className="font-medium text-slate-900 text-sm leading-5 group-hover:text-red-600 transition-colors line-clamp-2">
            {name}
          </h3>
          
          {/* Rating and Reviews */}
          {/* {rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-slate-700">{rating}</span>
              </div>
              {reviewCount && (
                <span className="text-xs text-slate-500">({reviewCount} reviews)</span>
              )}
            </div>
          )} */}
          
          {/* Pricing Information */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900">₹{price.toLocaleString()}</span>
              <span className="text-sm text-slate-600 font-medium">/ {unit}</span>
            </div>
            
            {/* MOQ Information */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                MOQ: <span className="font-medium text-slate-700">{minOrderQuantity.toLocaleString()} {unit}{minOrderQuantity > 1 ? 's' : ''}</span>
              </div>
              
              {/* Price per MOQ */}
              <div className="text-xs text-slate-600 font-medium">
                ₹{(price * minOrderQuantity).toLocaleString()} min
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Wrap with Link for navigation
  return (
    <Link 
      href={`/products/${id}`} 
      className="block group hover:scale-[1.02] transition-transform duration-300"
    >
      {cardContent}
    </Link>
  );
}
