export interface Medicine {
  id: string;
  name: string;
  generic: string;
  barcode: string;
  brand: string;
  price: number;
  stockQuantity: number;
  isDiscounted: boolean;
  discountPercent: number;
  imageUrl?: string;
  isInStock: boolean;
  discountedPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}