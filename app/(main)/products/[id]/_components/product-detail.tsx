import type { ProductDetail } from "@/actions/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";

export default function ProductDetails({ product }: { product: ProductDetail }) {
    return (
        <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex justify-between items-center">
            <p>Details</p>
            <Pencil size={16} className="text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
        <h4 className="font-semibold">Description</h4>
          <p className="text-sm mt-2">{product.description || "No description available"}</p>
          <Separator className="my-4"/>
          <h4 className="font-semibold">Specifications</h4>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {product.specifications
              ? Object.entries(product.specifications).map(
                  ([key, value]) => (
                    <div key={key} className="flex items-center">
                      <p className="font-bold text-sm">{key}:</p>
                      <p className="ml-2 text-sm">{value as string}</p>
                    </div>
                  )
                )
              : "No specifications available"}
          </div>
        </CardContent>
      </Card>
    );
}