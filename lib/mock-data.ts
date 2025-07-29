import placeholder from '@/public/placeholder.svg';
import { StaticImageData } from 'next/image';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: StaticImageData;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export interface City {
  id: string;
  name: string;
  businessCount: number;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  minOrderQuantity: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  image: StaticImageData;
  category: string;
}

export const categories: Category[] = [
  { 
    id: '1', 
    name: 'Electronics', 
    slug: 'electronics', 
    image: placeholder,
    subcategories: [
      { id: '1-1', name: 'Industrial Electronics', slug: 'industrial-electronics', productCount: 1250 },
      { id: '1-2', name: 'LED & Lighting', slug: 'led-lighting', productCount: 890 },
      { id: '1-3', name: 'Control Systems', slug: 'control-systems', productCount: 670 },
      { id: '1-4', name: 'Power Equipment', slug: 'power-equipment', productCount: 540 },
      { id: '1-5', name: 'Electronic Components', slug: 'electronic-components', productCount: 2100 },
    ]
  },
  { 
    id: '2', 
    name: 'Textiles', 
    slug: 'textiles', 
    image: placeholder,
    subcategories: [
      { id: '2-1', name: 'Cotton Fabrics', slug: 'cotton-fabrics', productCount: 980 },
      { id: '2-2', name: 'Synthetic Fabrics', slug: 'synthetic-fabrics', productCount: 750 },
      { id: '2-3', name: 'Home Textiles', slug: 'home-textiles', productCount: 620 },
      { id: '2-4', name: 'Industrial Textiles', slug: 'industrial-textiles', productCount: 430 },
      { id: '2-5', name: 'Garment Accessories', slug: 'garment-accessories', productCount: 1200 },
    ]
  },
  { 
    id: '3', 
    name: 'Machinery', 
    slug: 'machinery', 
    image: placeholder,
    subcategories: [
      { id: '3-1', name: 'Industrial Motors', slug: 'industrial-motors', productCount: 560 },
      { id: '3-2', name: 'Construction Equipment', slug: 'construction-equipment', productCount: 340 },
      { id: '3-3', name: 'Manufacturing Tools', slug: 'manufacturing-tools', productCount: 780 },
      { id: '3-4', name: 'Packaging Machines', slug: 'packaging-machines', productCount: 290 },
      { id: '3-5', name: 'Agricultural Equipment', slug: 'agricultural-equipment', productCount: 450 },
    ]
  },
  { 
    id: '4', 
    name: 'Chemicals', 
    slug: 'chemicals', 
    image: placeholder,
    subcategories: [
      { id: '4-1', name: 'Industrial Chemicals', slug: 'industrial-chemicals', productCount: 890 },
      { id: '4-2', name: 'Pharmaceutical Raw Materials', slug: 'pharmaceutical-raw-materials', productCount: 560 },
      { id: '4-3', name: 'Specialty Chemicals', slug: 'specialty-chemicals', productCount: 340 },
      { id: '4-4', name: 'Laboratory Chemicals', slug: 'laboratory-chemicals', productCount: 230 },
      { id: '4-5', name: 'Food Grade Chemicals', slug: 'food-grade-chemicals', productCount: 180 },
    ]
  },
  { 
    id: '5', 
    name: 'Automotive', 
    slug: 'automotive', 
    image: placeholder,
    subcategories: [
      { id: '5-1', name: 'Auto Parts', slug: 'auto-parts', productCount: 1450 },
      { id: '5-2', name: 'Tires & Wheels', slug: 'tires-wheels', productCount: 670 },
      { id: '5-3', name: 'Automotive Electronics', slug: 'automotive-electronics', productCount: 540 },
      { id: '5-4', name: 'Engine Components', slug: 'engine-components', productCount: 890 },
      { id: '5-5', name: 'Body Parts', slug: 'body-parts', productCount: 720 },
    ]
  },
  { 
    id: '6', 
    name: 'Construction', 
    slug: 'construction', 
    image: placeholder,
    subcategories: [
      { id: '6-1', name: 'Building Materials', slug: 'building-materials', productCount: 2100 },
      { id: '6-2', name: 'Steel & Metal', slug: 'steel-metal', productCount: 890 },
      { id: '6-3', name: 'Plumbing Supplies', slug: 'plumbing-supplies', productCount: 560 },
      { id: '6-4', name: 'Electrical Supplies', slug: 'electrical-supplies', productCount: 780 },
      { id: '6-5', name: 'Safety Equipment', slug: 'safety-equipment', productCount: 340 },
    ]
  },
];

export const cities: City[] = [
  { id: '1', name: 'Mumbai', businessCount: 12450, slug: 'mumbai' },
  { id: '2', name: 'Delhi', businessCount: 11890, slug: 'delhi' },
  { id: '3', name: 'Bangalore', businessCount: 9870, slug: 'bangalore' },
  { id: '4', name: 'Hyderabad', businessCount: 7650, slug: 'hyderabad' },
  { id: '5', name: 'Chennai', businessCount: 6540, slug: 'chennai' },
  { id: '6', name: 'Pune', businessCount: 5430, slug: 'pune' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Industrial Motor 10HP',
    price: 25000,
    unit: 'piece',
    minOrderQuantity: 2,
    rating: 4.5,
    reviewCount: 128,
    isVerified: true,
    image: placeholder,
    category: 'machinery',
  },
  {
    id: '2',
    name: 'Cotton Fabric Roll',
    price: 120,
    unit: 'meter',
    minOrderQuantity: 100,
    rating: 4.2,
    reviewCount: 89,
    isVerified: true,
    image: placeholder,
    category: 'textiles',
  },
  {
    id: '3',
    name: 'PLC Controller',
    price: 15500,
    unit: 'piece',
    minOrderQuantity: 1,
    rating: 4.7,
    reviewCount: 64,
    isVerified: true,
    image: placeholder,
    category: 'electronics',
  },
  {
    id: '4',
    name: 'Industrial Chemicals',
    price: 450,
    unit: 'kg',
    minOrderQuantity: 25,
    rating: 4.3,
    reviewCount: 45,
    isVerified: true,
    image: placeholder,
    category: 'chemicals',
  },
  {
    id: '5',
    name: 'Steel Pipes',
    price: 850,
    unit: 'meter',
    minOrderQuantity: 50,
    rating: 4.6,
    reviewCount: 92,
    isVerified: true,
    image: placeholder,
    category: 'construction',
  },
  {
    id: '6',
    name: 'LED Light Panels',
    price: 2200,
    unit: 'piece',
    minOrderQuantity: 10,
    rating: 4.4,
    reviewCount: 156,
    isVerified: true,
    image: placeholder,
    category: 'electronics',
  },
];

export const featuredSuppliers = [
  { id: '1', name: 'Techtronix India', category: 'Electronics', rating: 4.8 },
  { id: '2', name: 'Textile World', category: 'Textiles', rating: 4.6 },
  { id: '3', name: 'Machino Works', category: 'Machinery', rating: 4.9 },
  { id: '4', name: 'ChemPro Solutions', category: 'Chemicals', rating: 4.5 },
];

// Trust indicators and platform stats
export const platformStats = {
  totalSuppliers: 125000,
  verifiedSuppliers: 45000,
  totalProducts: 2500000,
  totalCategories: 500,
  citiesCovered: 650,
  monthlyInquiries: 850000,
};

// Popular searches for quick access
export const popularSearches = [
  'Industrial Motors',
  'LED Lights',
  'Cotton Fabric',
  'Steel Pipes',
  'PLC Controllers',
  'Chemical Raw Materials',
  'Auto Parts',
  'Construction Materials',
];
