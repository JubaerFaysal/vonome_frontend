import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  
  selectedOrder: Order | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders(undefined, undefined, 1, 50).subscribe({
      next: (data: any) => {
        this.orders = data.data || data.orders; // depending on API wrapper
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loading = false;
      }
    });
  }

  viewOrder(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderView(): void {
    this.selectedOrder = null;
  }
}
