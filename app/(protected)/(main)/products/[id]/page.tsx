"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Images } from "@/utils/constant";
import {
  ArrowLeft,
  BarChart2,
  Check,
  Edit,
  Eye,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Share2,
  Star,
  Trash2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";

type Product = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  sku: string;
  status: 'active' | 'draft' | 'out_of_stock' | 'low_stock';
  stock: number;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  images: string[];
  variants?: {
    id: string;
    name: string;
    options: string[];
  }[];
  createdAt: string;
  updatedAt: string;
  views: number;
  enquiries: number;
  conversionRate: number;
};

type Params = Promise<{ slug: string }>;

export default function ProductDetailPage({ params }: { params: Params }) {
  const router = useRouter();
  const paramsData = use(params)
  const productId = paramsData.slug;

  // Mock product data - replace with API call
  const product: Product = {
    id: productId,
    title: "Premium Stainless Steel Water Bottle",
    price: 1299,
    originalPrice: 1599,
    sku: "TMT-500D",
    status: "active",
    stock: 1250,
    category: "Drinkware",
    brand: "AquaTech",
    rating: 4.8,
    reviewCount: 156,
    views: 1245,
    enquiries: 45,
    conversionRate: 3.6,
    description: "High-quality stainless steel water bottles perfect for corporate gifting, bulk orders for offices, schools, and promotional events. Made from food-grade 304 stainless steel with double-wall insulation technology.",
    features: [
      "Food-grade 304 stainless steel construction",
      "Double-wall vacuum insulation keeps drinks hot/cold for hours",
      "Leak-proof design with secure cap mechanism",
      "BPA-free and eco-friendly alternative to plastic bottles",
      "Custom logo printing available for bulk orders"
    ],
    specifications: {
      "Material": "304 Stainless Steel",
      "Capacity": "500ml / 750ml / 1000ml",
      "Weight": "280g (500ml variant)",
      "Dimensions": "25cm x 7cm diameter",
      "Colors": "Silver, Black, Blue, Red, Green",
      "Certification": "FDA approved, BPA-free",
      "MOQ": "50 units",
      "Lead Time": "7-14 days",
      "Packaging": "Individual boxes, bulk packaging available"
    },
    images: [Images.placeholder, Images.placeholder, Images.placeholder],
    variants: [
      { id: "color", name: "Color", options: ["Red", "Blue", "Black"] },
      { id: "size", name: "Size", options: ["500ml", "750ml", "1L"] }
    ],
    createdAt: "2023-10-15T10:30:00Z",
    updatedAt: "2023-11-20T14:45:00Z"
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/products/${productId}`);
    toast.success("Product link copied to clipboard");
  };

  const handleDelete = () => {
    // Implement delete logic
    toast.success("Product moved to trash");
    router.push("/products");
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'outline';
      case 'out_of_stock':
        return 'destructive';
      case 'low_stock':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/products/${productId}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleCopyLink}
          >
            <LinkIcon className="h-4 w-4" />
            Copy Link
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left Column - Product Info */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{product.title}</h1>
                  <Badge variant={getStatusVariant(product.status)} className="uppercase">
                    {product.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{product.views} views</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                SKU: {product.sku} • Last updated: {new Date(product.updatedAt).toLocaleDateString()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden">
                        <Image
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Stock Status</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ 
                              width: `${Math.min(100, (product.stock / 2000) * 100)}%` 
                            }} 
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{product.category}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Brand</p>
                        <p className="font-medium">{product.brand}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-3">Performance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Views</p>
                        <p className="text-xl font-bold">{product.views}</p>
                      </div>
                      <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Enquiries</p>
                        <p className="text-xl font-bold">{product.enquiries}</p>
                      </div>
                      <div className="space-y-1 text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Conversion</p>
                        <p className="text-xl font-bold">{product.conversionRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-medium mb-4">Product Description</h3>
                    <p className="text-muted-foreground">{product.description}</p>
                    
                    <h3 className="text-lg font-medium mt-8 mb-4">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
                        <span className="font-medium text-muted-foreground">{key}</span>
                        <span className="col-span-2">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Engagement Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Views</p>
                          <p className="text-2xl font-bold">{product.views}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Enquiries</p>
                          <p className="text-2xl font-bold">{product.enquiries}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground">Conversion Rate</p>
                          <p className="text-2xl font-bold">{product.conversionRate}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Recent Activity</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="p-2 bg-blue-50 rounded-full">
                            <Eye className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Page view</p>
                            <p className="text-sm text-muted-foreground">
                              Viewed by a buyer from Mumbai, India
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="p-2 bg-green-50 rounded-full">
                            <MessageSquare className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">New enquiry</p>
                            <p className="text-sm text-muted-foreground">
                              Received from ABC Corporation
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Edit className="h-4 w-4" />
                Edit Product
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart2 className="h-4 w-4" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete Product
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Product Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Visibility</span>
                  <Badge variant="outline" className="uppercase">
                    {product.status === 'active' ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Share this product with buyers or on social media
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyLink}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}