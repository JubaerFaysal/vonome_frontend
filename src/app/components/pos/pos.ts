import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../models/customer.model';
import { Medicine } from '../../models/medicine.model';
import { CartItem } from '../../models/order.model';
import { CartService } from '../../services/cart';
import { CustomerService } from '../../services/customer';
import { MedicineService } from '../../services/medicine';
import { AddCustomerComponent } from '../add-customer/add-customer';
import { PaymentComponent } from '../payment/payment';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, AddCustomerComponent, PaymentComponent],
  templateUrl: './pos.html',
  host: { class: 'flex flex-1 min-h-0 overflow-hidden' }
})

export class PosComponent implements OnInit {
  medicines: Medicine[] = [];
  cartItems: CartItem[] = [];
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  searchQuery = '';
  selectedFilter: 'all' | 'in-stock' | 'out-of-stock' | 'discount' = 'all';
  selectedBrand = '';
  brands = ['Square', 'Incepta', 'Beximco', 'Opsonin', 'Renata', 'ACI', 'Aristopharma'];
  cartDiscount = 0;
  loading = false;
  
  showAddCustomer = false;
  showPayment = false;
  currentDate = new Date();
  totals = { subtotal: 0, vatAmount: 0, total: 0, itemCount: 0, items: 0 };

  constructor(
    private medicineService: MedicineService,
    private cartService: CartService,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMedicines();
    this.loadCustomers();
    this.cartService.items$.subscribe((items: CartItem[]) => {
      this.cartItems = items;
      this.calculateTotals();
    });
  }

  loadMedicines() {
    this.loading = true;
    this.medicineService.getMedicines({
      search: this.searchQuery,
      filter: this.selectedFilter,
      brand: this.selectedBrand
    }).subscribe({
      next: (data: Medicine[]) => {
        this.medicines = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading medicines:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadCustomers() {
    this.customerService.getCustomers(1, 100).subscribe({
      next: (data: any) => {
        this.customers = data.customers;
      },
      error: (err: any) => console.error('Error loading customers:', err)
    });
  }

  onSearch() {
    this.loadMedicines();
  }

  onBarcodeScan(event: any) {
    const barcode = event.target.value;
    if (barcode) {
      this.medicineService.getMedicines({ search: barcode }).subscribe({
        next: (medicines: Medicine[]) => {
          if (medicines.length > 0) {
            this.addToCart(medicines[0]);
            event.target.value = '';
          }
        }
      });
    }
  }

  addToCart(medicine: Medicine) {
    if (medicine.isInStock) {
      this.cartService.addToCart(medicine);
    }
  }

  updateQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty > 0) {
      this.cartService.updateQuantity(item.medicine.id, newQty);
    }
  }

  updateItemDiscount(item: CartItem, event: any) {
    let discount = parseFloat(event.target.value) || 0;
    if (discount < 0) discount = 0;
    if (discount > 100) discount = 100;
    this.cartService.updateDiscount(item.medicine.id, discount);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.medicine.id);
  }

  calculateTotals() {
    this.totals = this.cartService.getTotals();
  }

  resetCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
      this.cartService.clearCart();
      this.cartDiscount = 0;
    }
  }

  applyCartDiscount() {
    const discount = prompt('Enter discount percentage (0-100):', '0');
    if (discount !== null) {
      const val = parseFloat(discount);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        this.cartDiscount = (this.totals.subtotal * val) / 100;
      }
    }
  }

  checkout() {
    if (this.cartItems.length === 0) return;
    this.showPayment = true;
  }

  onPaymentComplete(order: any) {
    this.cartDiscount = 0;
    this.selectedCustomer = null;
    this.showPayment = false;
    alert(`Order completed successfully!\nOrder ID: ${order.id}\nTotal: Tk. ${order.totalAmount}`);
  }

  onCustomerAdded(customer: Customer) {
    this.loadCustomers();
    this.selectedCustomer = customer;
    this.showAddCustomer = false;
  }
}