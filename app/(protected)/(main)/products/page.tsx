// app/(protected)/(main)/products/page.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import Link from "next/link"

// Mock data - replace with API calls in a real implementation
const products = [
  {
    id: "1",
    name: "TMT Steel Bars",
    sku: "TMT-500D",
    price: "₹65,000",
    stock: 1250,
    status: "active",
    views: 245,
    enquiries: 18,
    lastUpdated: "2023-11-15"
  },
  {
    id: "2",
    name: "PPR Pipes",
    sku: "PPR-20MM",
    price: "₹120/meter",
    stock: 0,
    status: "out_of_stock",
    views: 189,
    enquiries: 12,
    lastUpdated: "2023-11-10"
  },
  {
    id: "3",
    name: "Ceramic Tiles",
    sku: "CT-60x60",
    price: "₹45/sq.ft",
    stock: 2500,
    status: "active",
    views: 312,
    enquiries: 24,
    lastUpdated: "2023-11-18"
  },
  {
    id: "4",
    name: "Cement (50kg bag)",
    sku: "CMT-OPC53",
    price: "₹380/bag",
    stock: 500,
    status: "low_stock",
    views: 421,
    enquiries: 35,
    lastUpdated: "2023-11-20"
  },
  {
    id: "5",
    name: "Electrical Wires",
    sku: "EW-2.5SQMM",
    price: "₹1,200/roll",
    stock: 0,
    status: "draft",
    views: 0,
    enquiries: 0,
    lastUpdated: "2023-11-05"
  }
]

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product listings and inventory</p>
        </div>
        <Link href="/products/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <CardTitle>All Products</CardTitle>
              <CardDescription>View and manage your product listings</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enquiries</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="group">
                  <TableCell className="font-medium">
                    <Link href={`/products/${product.id}`} className="hover:text-primary">
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stock.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active"
                          ? "default"
                          : product.status === "draft"
                          ? "outline"
                          : product.status === "out_of_stock"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {product.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{product.enquiries}</span>
                      {product.enquiries > 0 && (
                        <span className="text-muted-foreground text-xs">
                          ({Math.round((product.enquiries / product.views) * 100)}% conversion)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between">
                      <span>{new Date(product.lastUpdated).toLocaleDateString()}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">5</span> products
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}