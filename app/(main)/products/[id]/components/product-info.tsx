import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Info, Package, Tag } from "lucide-react";

type ProductInfoProps = {
  name: string;
  price: number;
  stockQuantity: number;
  category?: string | null;
  moq?: number;
  unit?: string;
};

export function ProductInfo({
  name,
  price,
  stockQuantity,
  category,
  moq = 1,
  unit = "unit",
}: ProductInfoProps) {
  const isOutOfStock = stockQuantity === 0;
  const isLowStock = stockQuantity > 0 && stockQuantity <= moq;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Section */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              ₹{price.toLocaleString()}
            </span>
            <span className="text-muted-foreground">/ {unit}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Category */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span className="text-sm">Category</span>
            </div>
            <p className="font-medium">{category || "Uncategorized"}</p>
          </div>

          {/* MOQ */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Box className="h-4 w-4" />
              <span className="text-sm">Minimum Order</span>
            </div>
            <p className="font-medium">{moq} {unit}{moq > 1 ? 's' : ''}</p>
          </div>

            {/* Stock Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="text-sm">Stock Status</span>
          </div>
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <Badge variant="destructive" className="px-3 py-1.5">
                Out of Stock
              </Badge>
            ) : isLowStock ? (
              <Badge variant="warning" className="px-3 py-1.5">
                Low Stock: {stockQuantity} left
              </Badge>
            ) : (
              <Badge variant="outline" className="px-3 py-1.5">
                In Stock: {stockQuantity}
              </Badge>
            )}
          </div>
        </div>
        </div>

        {isOutOfStock && (
          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>This product is currently out of stock. Check back later or contact us for restock updates.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
