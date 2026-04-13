import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { CreateOrderDto, Order, PaymentDto } from '../models/order.model';

export interface OrderListResponse {
  data: Order[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface OrderFilters {
  status?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  createOrder(order: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to create order')))
    );
  }

  getOrders(filters: OrderFilters = {}): Observable<OrderListResponse> {
    let params = new HttpParams()
      .set('page', String(filters.page ?? 1))
      .set('limit', String(filters.limit ?? 50));
    if (filters.status) params = params.set('status', filters.status);
    if (filters.customerId) params = params.set('customerId', filters.customerId);

    return this.http.get<OrderListResponse>(this.apiUrl, { params }).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to load orders')))
    );
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to load order')))
    );
  }

  processPayment(payment: PaymentDto): Observable<Order> {
    const { orderId, ...paymentData } = payment;
    return this.http.post<Order>(`${this.apiUrl}/${orderId}/payment`, paymentData).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Payment failed')))
    );
  }

  updateOrderItem(
    orderId: string,
    itemId: string,
    data: { quantity?: number; discountPercent?: number }
  ): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/items/${itemId}`, data).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to update item')))
    );
  }

  removeOrderItem(orderId: string, itemId: string): Observable<Order> {
    return this.http.delete<Order>(`${this.apiUrl}/${orderId}/items/${itemId}`).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to remove item')))
    );
  }

  updateOrder(orderId: string, data: { customerId?: string; discountPercent?: number }): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}`, data).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to update order')))
    );
  }
}