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
import { Order, OrderStatus } from '../../models/order.model';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = false;
  errorMessage = '';
  selectedOrder: Order | null = null;

  statusFilter: '' | OrderStatus = '';
  customerIdFilter = '';

  readonly statusOptions: { value: '' | OrderStatus; label: string }[] = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  private readonly subs = new Subscription();
  private readonly customerSearch$ = new Subject<string>();

  constructor(
    private readonly orderService: OrderService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.customerSearch$
        .pipe(debounceTime(400), distinctUntilChanged())
        .subscribe(() => this.loadOrders())
    );
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.customerSearch$.complete();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    this.subs.add(
      this.orderService
        .getOrders({
          status: this.statusFilter || undefined,
          customerId: this.customerIdFilter || undefined,
          limit: 50,
        })
        .subscribe({
          next: data => {
            this.orders = data.data ?? [];
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

  onStatusChange(): void {
    this.loadOrders();
  }

  onCustomerIdInput(): void {
    this.customerSearch$.next(this.customerIdFilter);
  }

  viewOrder(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderView(): void {
    this.selectedOrder = null;
  }

  trackByOrderId(_: number, order: Order): string {
    return order.id;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }
}