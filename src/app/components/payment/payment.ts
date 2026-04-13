import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Order, PaymentMethod } from '../../models/order.model';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-payment',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
})
export class PaymentComponent implements OnInit, OnDestroy {
  readonly Math = Math;

  @Input() amount = 0;
  @Input() customer: any = null;

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly paid = new EventEmitter<Order>();
  @Output() readonly draft = new EventEmitter<void>();

  selectedMethod: PaymentMethod | '' = '';
  inputAmount = 0;
  returnAmount = 0;
  dueAmount = 0;
  loading = false;
  errorMessage = '';

  readonly paymentMethods: { id: PaymentMethod; name: string; icon: string }[] = [
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'bank_card', name: 'Bank/Card', icon: '💳' },
    { id: 'mfs', name: 'MFS', icon: '📱' },
  ];

  private readonly subs = new Subscription();

  constructor(
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inputAmount = this.amount;
    this.calculateChange();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  selectMethod(method: PaymentMethod): void {
    this.selectedMethod = method;
    this.errorMessage = '';
    this.inputAmount = method === 'cash'
      ? Math.ceil(this.amount / 10) * 10
      : this.amount;
    this.calculateChange();
  }

  setQuickAmount(amount: number): void {
    this.inputAmount = Math.max(0, amount);
    this.calculateChange();
  }

  getMethodName(): string {
    return this.paymentMethods.find(m => m.id === this.selectedMethod)?.name ?? '';
  }

  calculateChange(): void {
    if (this.inputAmount >= this.amount) {
      this.returnAmount = parseFloat((this.inputAmount - this.amount).toFixed(2));
      this.dueAmount = 0;
    } else {
      this.returnAmount = 0;
      this.dueAmount = parseFloat((this.amount - this.inputAmount).toFixed(2));
    }
    this.cdr.markForCheck();
  }

  canProcessPayment(): boolean {
    return !!this.selectedMethod && this.inputAmount > 0 && !this.loading;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.loading) {
      this.close.emit();
    }
  }

  processPayment(): void {
    if (!this.canProcessPayment()) return;

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const cartItems = this.cartService.getCartItems();
    if (cartItems.length === 0) {
      this.errorMessage = 'Cart is empty. Please add items before paying.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    const orderData = {
      customerId: this.customer?.id ?? undefined,
      items: cartItems.map(item => ({
        medicineId: item.medicine.id,
        quantity: item.quantity,
        discountPercent: item.discountPercent,
      })),
    };

    this.subs.add(
      this.orderService.createOrder(orderData).subscribe({
        next: order => {
          this.subs.add(
            this.orderService.processPayment({
              orderId: order.id,
              method: this.selectedMethod as PaymentMethod,
              amount: this.inputAmount,
            }).subscribe({
              next: completedOrder => {
                this.cartService.clearCart();
                this.loading = false;
                this.paid.emit(completedOrder);
              },
              error: (err: Error) => {
                this.errorMessage = err.message;
                this.loading = false;
                this.cdr.markForCheck();
              },
            })
          );
        },
        error: (err: Error) => {
          this.errorMessage = err.message;
          this.loading = false;
          this.cdr.markForCheck();
        },
      })
    );
  }

  saveAsDraft(): void {
    this.draft.emit();
  }
}