import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { CreateOrderDto, Order, PaymentDto } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(order: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  getOrders(status?: string, customerId?: string, page: number = 1, limit: number = 10): Observable<{ orders: Order[]; total: number }> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (customerId) url += `&customerId=${customerId}`;
    return this.http.get<{ orders: Order[]; total: number }>(url);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  processPayment(payment: PaymentDto): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/payment`, payment);
  }

  updateOrderItem(orderId: string, itemId: string, data: { quantity?: number; discountPercent?: number }): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/items/${itemId}`, data);
  }

  removeOrderItem(orderId: string, itemId: string): Observable<Order> {
    return this.http.delete<Order>(`${this.apiUrl}/${orderId}/items/${itemId}`);
  }

  updateOrder(orderId: string, data: { customerId?: string; discountPercent?: number }): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}`, data);
  }
}