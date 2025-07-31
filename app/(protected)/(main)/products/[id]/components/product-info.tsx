import { Star } from "lucide-react";

type ProductInfoProps = {
  name: string;
  price: number;
  compareAtPrice?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  stockQuantity: number;
  category?: string | null;
  businessName?: string | null;
  viewCount: number;
  enquiryCount: number;
  conversionRate: number;
};

export function ProductInfo({
  name,
  price,
  compareAtPrice,
  rating = 0,
  reviewCount = 0,
  stockQuantity,
  category,
  businessName,
  viewCount,
  enquiryCount,
  conversionRate,
}: ProductInfoProps) {
  const stockPercentage = Math.min(100, (stockQuantity / 2000) * 100);
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">₹{price.toLocaleString()}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
        {rating && rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              ({reviewCount?.toLocaleString()} reviews)
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Stock Status</h3>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  stockQuantity > 10 ? 'bg-green-500' : 'bg-yellow-500'
                }`} 
                style={{ width: `${stockPercentage}%` }} 
              />
            </div>
            <span className="text-sm font-medium">
              {stockQuantity} in stock
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="font-medium">{category || 'Uncategorized'}</p>
          </div>
          {businessName && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Business</p>
              <p className="font-medium">{businessName}</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="font-medium mb-3">Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Views</p>
            <p className="text-xl font-bold">{viewCount.toLocaleString()}</p>
          </div>
          <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Enquiries</p>
            <p className="text-xl font-bold">{enquiryCount.toLocaleString()}</p>
          </div>
          <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Conversion</p>
            <p className="text-xl font-bold">{conversionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
