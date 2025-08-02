import { Badge } from "@/components/ui/badge";

// Helper function to format price
export const formatPrice = (price: number | null, unit: string = '') => {
  if (price === null) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price) + (unit ? `/${unit}` : '');
};

// Helper function to get stock status
export const getStockStatus = (stock: number, isActive: boolean): string => {
  if (!isActive) return 'draft';
  if (stock <= 0) return 'out_of_stock';
  if (stock < 10) return 'low_stock';
  return 'active';
};

// Component for stock status badge
export const StockStatusBadge = ({ stock, isActive }: { stock: number, isActive: boolean }) => {
  const status = getStockStatus(stock, isActive);
  const statusText = status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <Badge
      variant={
        status === 'active' ? 'default' :
        status === 'draft' ? 'outline' :
        status === 'out_of_stock' ? 'destructive' :
        'secondary'
      }
      className="capitalize"
    >
      {statusText}
    </Badge>
  );
};