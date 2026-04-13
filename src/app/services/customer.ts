import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { Customer } from '../models/customer.model';

export interface CustomerListResponse {
  data: Customer[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly apiUrl = `${environment.apiUrl}/customers`;

  constructor(private readonly http: HttpClient) {}

  getCustomers(page = 1, limit = 100): Observable<CustomerListResponse> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<CustomerListResponse>(this.apiUrl, { params }).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to load customers')))
    );
  }

  searchCustomers(query: string): Observable<Customer[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Customer[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Search failed')))
    );
  }

  getCustomer(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to load customer')))
    );
  }

  createCustomer(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to create customer')))
    );
  }

  updateCustomer(id: string, customer: Partial<Customer>): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}`, customer).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to update customer')))
    );
  }
}