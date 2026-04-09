import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order, PaymentMethod } from '../../models/order.model';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html'
})
export class PaymentComponent implements OnInit {
  Math = Math;
  
  @Input() amount: number = 0;
  @Input() customer: any = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() paid = new EventEmitter<Order>();
  @Output() draft = new EventEmitter<void>();

  selectedMethod: PaymentMethod | '' = '';
  inputAmount: number = 0;
  returnAmount: number = 0;
  dueAmount: number = 0;
  loading = false;
  errorMessage = '';

  paymentMethods = [
    { id: 'cash' as PaymentMethod, name: 'Cash', icon: '💵' },
    { id: 'bank_card' as PaymentMethod, name: 'Bank/Card', icon: '💳' },
    { id: 'mfs' as PaymentMethod, name: 'MFS', icon: '📱' }
  ];

  constructor(
    private orderService: OrderService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Auto-set input to exact amount for convenience
    this.inputAmount = this.amount;
    this.calculateChange();
  }

  selectMethod(method: PaymentMethod) {
    this.selectedMethod = method;
    this.errorMessage = '';
    if (method === 'cash') {
      // For cash, suggest rounded amount
      this.inputAmount = Math.ceil(this.amount / 10) * 10;
      this.calculateChange();
    } else {
      this.inputAmount = this.amount;
      this.calculateChange();
    }
  }

  setQuickAmount(amount: number) {
    this.inputAmount = amount;
    this.calculateChange();
  }

  getMethodName(): string {
    const method = this.paymentMethods.find(m => m.id === this.selectedMethod);
    return method ? method.name : '';
  }

  calculateChange() {
    if (this.inputAmount >= this.amount) {
      this.returnAmount = this.inputAmount - this.amount;
      this.dueAmount = 0;
    } else {
      this.returnAmount = 0;
      this.dueAmount = this.amount - this.inputAmount;
    }
  }

  canProcessPayment(): boolean {
    return !!this.selectedMethod && this.inputAmount > 0 && !this.loading;
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget && !this.loading) {
      this.close.emit();
    }
  }

  processPayment() {
    if (!this.canProcessPayment()) return;
    
    this.loading = true;
    this.errorMessage = '';
    
    const cartItems = this.cartService.getCartItems();
    
    if (cartItems.length === 0) {
      this.errorMessage = 'Cart is empty';
      this.loading = false;
      return;
    }

    const orderData = {
      customerId: this.customer?.id,
      items: cartItems.map((item: any) => ({
        medicineId: item.medicine.id,
        quantity: item.quantity,
        discountPercent: item.discountPercent
      }))
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order: any) => {
        const paymentData = {
          orderId: order.id,
          method: this.selectedMethod as PaymentMethod,
          amount: this.inputAmount
        };
        
        this.orderService.processPayment(paymentData).subscribe({
          next: (completedOrder: any) => {
            this.cartService.clearCart();
            this.paid.emit(completedOrder);
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Payment processing error:', err);
            this.errorMessage = err.error?.message || 'Payment processing failed. Please try again.';
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Order creation error:', err);
        this.errorMessage = err.error?.message || 'Failed to create order. Please check stock availability.';
        this.loading = false;
      }
    });
  }

  saveAsDraft() {
    this.draft.emit();
  }
}