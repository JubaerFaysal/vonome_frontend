import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Medicine } from '../models/medicine.model';
import { CartItem, OrderItem } from '../models/order.model';

export interface CartTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
  itemCount: number;
  items: number;
}

const CART_STORAGE_KEY = 'vonome_cart';
const VAT_RATE = 0.10;

@Injectable({ providedIn: 'root' })
export class CartService implements OnDestroy {
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>([]);

  readonly items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  readonly totals$: Observable<CartTotals> = this.items$.pipe(
    map(items => this.computeTotals(items))
  );

  readonly isEmpty$: Observable<boolean> = this.items$.pipe(
    map(items => items.length === 0)
  );

  constructor() {
    this.restoreFromStorage();
  }

  ngOnDestroy(): void {
    this.itemsSubject.complete();
  }

  private restoreFromStorage(): void {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.itemsSubject.next(parsed);
        }
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }

  private persist(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage quota exceeded or unavailable — fail silently
    }
  }

  private emit(items: CartItem[]): void {
    this.itemsSubject.next(items);
    this.persist(items);
  }

  private computeSubtotal(item: CartItem): number {
    const base = item.unitPrice * item.quantity;
    return base * (1 - (item.discountPercent ?? 0) / 100);
  }

  private computeTotals(items: CartItem[]): CartTotals {
    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const vatAmount = subtotal * VAT_RATE;
    return {
      subtotal,
      vatAmount,
      total: subtotal + vatAmount,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      items: items.length,
    };
  }

  addToCart(medicine: Medicine, quantity = 1): void {
    const current = [...this.itemsSubject.value];
    const idx = current.findIndex(i => i.medicine.id === medicine.id);

    if (idx >= 0) {
      const updated = { ...current[idx], quantity: current[idx].quantity + quantity };
      updated.subtotal = this.computeSubtotal(updated);
      current[idx] = updated;
    } else {
      const newItem: CartItem = {
        medicine,
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity,
        discountPercent: 0,
        unitPrice: medicine.discountedPrice,
        subtotal: medicine.discountedPrice * quantity,
      };
      current.push(newItem);
    }

    this.emit(current);
  }

  removeFromCart(medicineId: string): void {
    this.emit(this.itemsSubject.value.filter(i => i.medicine.id !== medicineId));
  }

  updateQuantity(medicineId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(medicineId);
      return;
    }
    const current = this.itemsSubject.value.map(i => {
      if (i.medicine.id !== medicineId) return i;
      const updated = { ...i, quantity };
      updated.subtotal = this.computeSubtotal(updated);
      return updated;
    });
    this.emit(current);
  }

  updateDiscount(medicineId: string, discountPercent: number): void {
    const clamped = Math.min(100, Math.max(0, discountPercent));
    const current = this.itemsSubject.value.map(i => {
      if (i.medicine.id !== medicineId) return i;
      const updated = { ...i, discountPercent: clamped };
      updated.subtotal = this.computeSubtotal(updated);
      return updated;
    });
    this.emit(current);
  }

  clearCart(): void {
    this.emit([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  getCartItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getTotals(): CartTotals {
    return this.computeTotals(this.itemsSubject.value);
  }

  toOrderItems(): OrderItem[] {
    return this.itemsSubject.value.map(({ medicineId, medicineName, quantity, unitPrice, discountPercent, subtotal }) => ({
      medicineId, medicineName, quantity, unitPrice, discountPercent, subtotal,
    }));
  }
}