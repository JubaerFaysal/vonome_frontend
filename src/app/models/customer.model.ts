export type CustomerType = 'individual' | 'business';

export interface Customer {
  id: string;
  type: CustomerType;
  title: string;
  name: string;
  displayName: string;
  phone: string;
  email?: string;
  billingAddress?: string;
  createdAt?: Date;
}