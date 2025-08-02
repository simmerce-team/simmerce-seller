
type ProductInfoProps = {
  name: string;
  price: number;
  stockQuantity: number;
  category?: string | null;
  moq?: string | null;
  viewCount: number;
  enquiryCount: number;
  conversionRate: number;
};

export function ProductInfo({
  name,
  price,
  stockQuantity,
  category,
  moq,
  viewCount,
  enquiryCount,
  conversionRate,
}: ProductInfoProps) {
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-semibold">{name}</h2>
        <span className="text-2xl font-bold">₹{price.toLocaleString()}</span>
      </div>


        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Category</p>
            <p className="font-medium">{category || 'Uncategorized'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Stock Quantity</p>
            <p className="font-medium">{stockQuantity}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">MOQ</p>
            <p className="font-medium">{moq}</p>
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
