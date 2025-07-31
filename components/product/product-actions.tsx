'use client';

import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

interface ProductActionsProps {
  productId: string | number;
  price: number;
  sellerId: string | number;
  className?: string;
}

export function ProductActions({ 
  productId, 
  className = '' 
}: ProductActionsProps) {

  const handleInquire = () => {
    console.log('Initiating inquiry for product:', productId);
    // TODO: Implement inquiry logic
  };

  const handleChat = () => {
    console.log('Starting chat for product:', productId);
    // TODO: Implement chat logic
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this product',
        text: 'I found this amazing product for you!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard", {
        description: "Share this product with others!"
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Action Buttons */}
      <div className="space-y-3">
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-12"
            onClick={handleInquire}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Enquire Now
          </Button>
          <Button 
            variant="outline" 
            className="h-12"
            onClick={handleChat}
          >
            <Phone className="w-5 h-5 mr-2" />
            Call Seller
          </Button>
        </div>
      </div>
    </div>
  );
}
