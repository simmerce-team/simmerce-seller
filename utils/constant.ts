export const Images = {
  logo: "/simmerce.svg",
  placeholder: "/placeholder.svg",
  user: "/placeholder-user.jpg",
  pdf: "/pdf.svg",
};

export const UNITS = [
  { value: "pcs", label: "Pieces" },
  { value: "kg", label: "Kilograms" },
  { value: "g", label: "Grams" },
  { value: "l", label: "Liters" },
  { value: "ml", label: "Milliliters" },
  { value: "m", label: "Meters" },
  { value: "cm", label: "Centimeters" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
  { value: "set", label: "Set" },
];

export const MAX_IMAGES = 3;
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_PDF_SIZE = 2 * 1024 * 1024; // 2MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
export const ALLOWED_PDF_TYPE = 'application/pdf';