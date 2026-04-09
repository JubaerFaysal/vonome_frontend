import { Medicine } from './medicine.model';

export type OrderStatus = 'draft' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'bank_card' | 'mfs';

export interface OrderItem {
  id?: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
  medicine?: Medicine;
}

export interface Order {
  id: string;
  customerId?: string;
  customer?: any;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  returnAmount: number;
  createdAt?: Date;
  items: OrderItem[];
}

export interface CartItem extends OrderItem {
  medicine: Medicine;
}

export interface CreateOrderDto {
  customerId?: string;
  items: {
    medicineId: string;
    quantity: number;
    discountPercent?: number;
  }[];
}

export interface PaymentDto {
  orderId: string;
  method: PaymentMethod;
  amount: number;
}