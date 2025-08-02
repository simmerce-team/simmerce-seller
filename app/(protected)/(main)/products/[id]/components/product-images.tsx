import { Images } from "@/utils/constant";
import Image from "next/image";

type ProductImagesProps = {
  images: Array<{
    id: string;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
  }>;
    name: string;
};

export function ProductImages({ images, name }: ProductImagesProps) {
  // If no images, show a placeholder
  const displayImages = images.length > 0 ? images : [
    { id: 'placeholder', url: Images.placeholder, alt_text: 'No image available', is_primary: true }
  ];

  const primaryImage = displayImages.find(img => img.is_primary) || displayImages[0];

  return (
    <div className="space-y-4">
      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt_text || name}
          width={500}
          height={500}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayImages.map((image) => (
            <div key={image.id} className="aspect-square bg-muted rounded-md overflow-hidden">
              <Image
                src={image.url}
                alt={image.alt_text || name}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
