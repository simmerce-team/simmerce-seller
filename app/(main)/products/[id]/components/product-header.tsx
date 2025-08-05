import { deleteProduct } from "@/actions/show-product";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Edit, Link as LinkIcon, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ProductHeaderProps = {
  product: {
    id: string;
    name: string;
    status: string;
    sku: string;
    updated_at: string;
    view_count: number;
  };
};

export function ProductHeader({ product }: ProductHeaderProps) {
  const router = useRouter();


  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/products/${product.id}`);
    toast.success("Product link copied to clipboard");
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      const { success, error } = await deleteProduct(product.id);
      if (success) {
        toast.success("Product deleted successfully");
        router.push("/products");
      } else {
        toast.error(error || "Failed to delete product");
      }
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-2" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Products</span>
      </Button>
      
      <div className="flex items-center gap-2">
        {/* Desktop Buttons */}
        <div className="hidden sm:flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/products/${product.id}/edit`}>
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleCopyLink}
          >
            <LinkIcon className="h-4 w-4" />
            <span>Copy Link</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
        
        {/* Mobile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="sm:hidden">
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/products/${product.id}/edit`} className="w-full cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
              <LinkIcon className="mr-2 h-4 w-4" />
              <span>Copy Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete} 
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
