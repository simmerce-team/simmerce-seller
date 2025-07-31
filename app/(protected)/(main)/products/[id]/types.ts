// Import from the correct path based on your project structure
// This is a fallback type in case the Supabase types are not available
type Database = any;

// Base types
export type ProductStatus = 'active' | 'draft' | 'out_of_stock' | 'low_stock' | 'archived';

type Timestamp = string;

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Simplified ProductDescription type
export type ProductDescription = string | null | undefined;

export interface ProductMetricsData {
  view_count: number;
  enquiry_count: number;
  conversion_rate: number;
  last_viewed: Timestamp | null;
  last_enquiry: Timestamp | null;
}

export interface RecentActivity {
  id: string;
  type: 'view' | 'enquiry' | 'update' | 'status_change';
  timestamp: Timestamp;
  user_id: string | null;
  user_name: string | null;
  details: Record<string, unknown> | null;
}

// Main Product type
export type Product = Omit<Database['public']['Tables']['products']['Row'], 'status'> & {
  status: ProductStatus;
  images: ProductImage[];
  category: Category | null;
  business: Business | null;
  description: ProductDescription;
  metrics: ProductMetricsData;
  recent_activity: RecentActivity[];
};

// Component Props
export interface ProductMetricsProps {
  viewCount: number;
  enquiryCount: number;
  conversionRate: number;
  recentActivity?: RecentActivity[];
}

export interface ProductHeaderProps {
  product: {
    id: string;
    name: string;
    status: ProductStatus;
    sku: string | null;
    updated_at: Timestamp;
    view_count: number;
  };
}

export interface ProductImagesProps {
  images: ProductImage[];
  name: string;
}

export interface ProductInfoProps {
  name: string;
  price: number;
  compareAtPrice?: number;
  rating?: number;
  reviewCount?: number;
  stockQuantity: number;
  category?: string | null;
  businessName?: string | null;
  viewCount: number;
  enquiryCount: number;
  conversionRate: number;
}

export interface ProductDescriptionProps {
  description: ProductDescription;
}

export interface ProductSidebarProps {
  productId: string;
  status: ProductStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  onDelete: () => Promise<void>;
}
