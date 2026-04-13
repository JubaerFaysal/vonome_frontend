import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import { Customer } from '../../models/customer.model';
import { Medicine } from '../../models/medicine.model';
import { CartItem, Order } from '../../models/order.model';
import { CartService, CartTotals } from '../../services/cart';
import { CustomerService } from '../../services/customer';
import { MedicineService } from '../../services/medicine';
import { AddCustomerComponent } from '../add-customer/add-customer';
import { PaymentComponent } from '../payment/payment';

@Component({
  selector: 'app-pos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AddCustomerComponent, PaymentComponent],
  templateUrl: './pos.html',
  host: { class: 'flex flex-1 min-h-0 overflow-hidden' },
})
export class PosComponent implements OnInit, OnDestroy {
  medicines: Medicine[] = [];
  cartItems: CartItem[] = [];
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;

  searchQuery = '';
  selectedFilter: 'all' | 'in-stock' | 'out-of-stock' | 'discount' = 'all';
  selectedBrand = '';
  readonly brands = ['Square', 'Incepta', 'Beximco', 'Opsonin', 'Renata', 'ACI', 'Aristopharma'];

  cartDiscount = 0;
  loading = false;
  errorMessage = '';

  showAddCustomer = false;
  showPayment = false;
  showCart = false; // mobile cart toggle

  readonly currentDate = new Date();
  totals: CartTotals = { subtotal: 0, vatAmount: 0, total: 0, itemCount: 0, items: 0 };

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();
  private readonly subs = new Subscription();

  constructor(
    private readonly medicineService: MedicineService,
    private readonly cartService: CartService,
    private readonly customerService: CustomerService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Cart subscription
    this.subs.add(
      this.cartService.items$.subscribe(items => {
        this.cartItems = items;
        this.cdr.markForCheck();
      })
    );

    this.subs.add(
      this.cartService.totals$.subscribe(totals => {
        this.totals = totals;
        this.cdr.markForCheck();
      })
    );

    // Debounced search
    this.subs.add(
      this.searchSubject$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
        this.loadMedicines();
      })
    );

    this.loadMedicines();
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subs.unsubscribe();
  }

  loadMedicines(): void {
    this.loading = true;
    this.errorMessage = '';
    this.subs.add(
      this.medicineService
        .getMedicines({
          search: this.searchQuery,
          filter: this.selectedFilter,
          brand: this.selectedBrand,
        })
        .subscribe({
          next: data => {
            this.medicines = data;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: (err: Error) => {
            this.errorMessage = err.message;
            this.loading = false;
            this.cdr.markForCheck();
          },
        })
    );
  }

  loadCustomers(): void {
    this.subs.add(
      this.customerService.getCustomers(1, 100).subscribe({
        next: data => {
          this.customers = data.data ?? [];
          this.cdr.markForCheck();
        },
        error: () => {}, // non-critical
      })
    );
  }

  onSearch(): void {
    this.searchSubject$.next(this.searchQuery);
  }

  onBarcodeScan(event: Event): void {
    const input = event.target as HTMLInputElement;
    const barcode = input.value.trim();
    if (!barcode) return;
    this.subs.add(
      this.medicineService.getMedicines({ search: barcode }).subscribe({
        next: medicines => {
          if (medicines.length > 0) {
            this.addToCart(medicines[0]);
            input.value = '';
          }
        },
        error: () => {},
      })
    );
  }

  addToCart(medicine: Medicine): void {
    if (!medicine.isInStock) return;
    this.cartService.addToCart(medicine);
  }

  updateQty(item: CartItem, delta: number): void {
    this.cartService.updateQuantity(item.medicine.id, item.quantity + delta);
  }

  setQty(item: CartItem, value: string): void {
    const qty = parseInt(value, 10);
    if (!isNaN(qty)) this.cartService.updateQuantity(item.medicine.id, qty);
  }

  updateItemDiscount(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const discount = Math.min(100, Math.max(0, parseFloat(input.value) || 0));
    this.cartService.updateDiscount(item.medicine.id, discount);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.medicine.id);
  }

  resetCart(): void {
    if (!confirm('Clear the cart? This cannot be undone.')) return;
    this.cartService.clearCart();
    this.cartDiscount = 0;
  }

  applyCartDiscount(): void {
    const input = prompt('Enter cart-level discount percentage (0–100):', '0');
    if (input === null) return;
    const val = parseFloat(input);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      this.cartDiscount = (this.totals.subtotal * val) / 100;
      this.cdr.markForCheck();
    }
  }

  get finalTotal(): number {
    return Math.max(0, this.totals.total - this.cartDiscount);
  }

  checkout(): void {
    if (this.cartItems.length === 0) return;
    this.showPayment = true;
  }

  onPaymentComplete(order: Order): void {
    this.cartDiscount = 0;
    this.selectedCustomer = null;
    this.showPayment = false;
    this.showCart = false;
    alert(`Order completed!\nOrder ID: ${order.id}\nTotal: Tk. ${order.totalAmount}`);
  }

  onCustomerAdded(customer: Customer): void {
    this.loadCustomers();
    this.selectedCustomer = customer;
    this.showAddCustomer = false;
  }

  trackByMedicineId(_: number, medicine: Medicine): string {
    return medicine.id;
  }

  trackByCartItem(_: number, item: CartItem): string {
    return item.medicine.id;
  }

  isMobile(): boolean {
    return window.innerWidth < 1024;
  }
}