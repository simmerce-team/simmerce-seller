
type ProductInfoProps = {
  name: string;
  price: number;
  stockQuantity: number;
  category?: string | null;
  moq?: number;
};

export function ProductInfo({
  name,
  price,
  stockQuantity,
  category,
  moq
}: ProductInfoProps) {
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
          <h2>{name}</h2>
          <span className="text-2xl font-bold">₹{price.toLocaleString()}</span>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Stock Status</h3>
          <span className="text-sm font-medium">
            {stockQuantity} in stock
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="font-medium">{category || 'Uncategorized'}</p>
          </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">MOQ</p>
              <p className="font-medium">{moq}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
