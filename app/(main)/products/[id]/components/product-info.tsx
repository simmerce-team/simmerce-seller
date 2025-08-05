import { Badge } from "@/components/ui/badge";

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
  moq,
  unit,
}: ProductInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2>{name}</h2>
        <span className="text-2xl font-bold">₹{price.toLocaleString()} <span className="text-muted-foreground text-sm">/ {unit}</span> </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Stock Quantity</p>
          {stockQuantity === 0 ? (
            <Badge variant="destructive">Out of Stock</Badge>
          ) : stockQuantity <= (moq || 1) ? (
            <Badge variant="warning">Low Stock ({stockQuantity})</Badge>
          ) : (
            <Badge variant="default">{stockQuantity}</Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Category</p>
          <p className="font-medium">{category || "Uncategorized"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">MOQ</p>
          <p className="font-medium">{moq}</p>
        </div>
      </div>
    </div>
  );
}
