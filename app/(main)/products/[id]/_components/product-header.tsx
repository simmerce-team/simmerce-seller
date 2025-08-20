import type { ProductDetail } from "@/actions/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";

export default function ProductHeader({ product }: { product: ProductDetail }) {
    return (
        <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex justify-between items-center">
            <p className="font-semibold">{product.name}</p>
            <Pencil
              size={16}
              className="text-muted-foreground cursor-pointer hover:text-primary"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Price</span>
            <span className="font-medium">
              ₹{product.price?.toLocaleString("en-IN") || "N/A"}{" "}
              <span className="text-sm text-muted-foreground">
                /{product.unit}
              </span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Stock</span>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  (product.stock_quantity || 0) > 0
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              ></span>
              <span className="font-medium">
                {(product.stock_quantity || 0) > 0
                  ? "In Stock"
                  : "Out of Stock"}
                <span className="text-muted-foreground ml-2">
                  ({product.stock_quantity || 0} {product.unit || "units"}
                  )
                </span>
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">SKU</span>
            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
              {product.sku || "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">
              Category
            </span>
            <span className="font-medium">
              {product.category?.name || "Uncategorized"}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-muted-foreground text-sm">Status</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </CardContent>
      </Card>
    );
}