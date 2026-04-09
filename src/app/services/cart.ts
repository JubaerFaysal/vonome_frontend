import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Medicine } from '../models/medicine.model';
import { CartItem, OrderItem } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  private currentOrderId: string | null = null;
  
  items$ = this.itemsSubject.asObservable();

  constructor() {
    // Load from localStorage on init
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.items = JSON.parse(saved);
      this.itemsSubject.next([...this.items]);
    }
  }

  private saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  addToCart(medicine: Medicine, quantity: number = 1) {
    const existing = this.items.find(item => item.medicine.id === medicine.id);
    
    if (existing) {
      existing.quantity += quantity;
      this.calculateItemSubtotal(existing);
    } else {
      const newItem: CartItem = {
        medicine,
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity,
        discountPercent: 0,
        unitPrice: medicine.discountedPrice,
        subtotal: medicine.discountedPrice * quantity
      };
      this.items.push(newItem);
    }
    
    this.itemsSubject.next([...this.items]);
    this.saveToStorage();
  }

  removeFromCart(medicineId: string) {
    this.items = this.items.filter(item => item.medicine.id !== medicineId);
    this.itemsSubject.next([...this.items]);
    this.saveToStorage();
  }

  updateQuantity(medicineId: string, quantity: number) {
    const item = this.items.find(i => i.medicine.id === medicineId);
    if (item && quantity > 0) {
      item.quantity = quantity;
      this.calculateItemSubtotal(item);
      this.itemsSubject.next([...this.items]);
      this.saveToStorage();
    }
  }

  updateDiscount(medicineId: string, discountPercent: number) {
    const item = this.items.find(i => i.medicine.id === medicineId);
    if (item) {
      item.discountPercent = discountPercent;
      this.calculateItemSubtotal(item);
      this.itemsSubject.next([...this.items]);
      this.saveToStorage();
    }
  }

  private calculateItemSubtotal(item: CartItem) {
    const basePrice = item.unitPrice * item.quantity;
    item.subtotal = basePrice * (1 - item.discountPercent / 100);
  }

  clearCart() {
    this.items = [];
    this.currentOrderId = null;
    this.itemsSubject.next([]);
    localStorage.removeItem('cart');
  }

  getCartItems(): CartItem[] {
    return this.items;
  }

  getTotals() {
    const subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    const vatAmount = subtotal * 0.10; // 10% VAT
    const total = subtotal + vatAmount;
    return { 
      subtotal, 
      vatAmount, 
      total, 
      itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0),
      items: this.items.length 
    };
  }

  setCurrentOrderId(orderId: string) {
    this.currentOrderId = orderId;
  }

  getCurrentOrderId(): string | null {
    return this.currentOrderId;
  }

  toOrderItems(): OrderItem[] {
    return this.items.map(item => ({
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      subtotal: item.subtotal
    }));
  }
}