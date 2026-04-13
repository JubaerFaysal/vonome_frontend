import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { Medicine } from '../models/medicine.model';

export interface MedicineFilters {
  search?: string;
  filter?: 'all' | 'in-stock' | 'out-of-stock' | 'discount';
  brand?: string;
}

interface MedicineApiResponse {
  data: any[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private readonly apiUrl = `${environment.apiUrl}/medicines`;

  constructor(private readonly http: HttpClient) {}

  getMedicines(filters: MedicineFilters = {}): Observable<Medicine[]> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.filter && filters.filter !== 'all') params = params.set('filter', filters.filter);
    if (filters.brand) params = params.set('brand', filters.brand);

    return this.http
      .get<MedicineApiResponse>(this.apiUrl, {
        params,
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      .pipe(
        map(res => (res?.data ?? []).map(item => this.mapMedicine(item))),
        catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to load medicines')))
      );
  }

  getMedicine(id: string): Observable<Medicine> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        map(item => this.mapMedicine(item)),
        catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to load medicine')))
      );
  }

  createMedicine(medicine: Partial<Medicine>): Observable<Medicine> {
    return this.http
      .post<any>(this.apiUrl, medicine)
      .pipe(
        map(item => this.mapMedicine(item)),
        catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to create medicine')))
      );
  }

  updateMedicine(id: string, medicine: Partial<Medicine>): Observable<Medicine> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, medicine)
      .pipe(
        map(item => this.mapMedicine(item)),
        catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to update medicine')))
      );
  }

  private mapMedicine(item: any): Medicine {
    const price = parseFloat(item.price);
    const discountPercent = parseFloat(item.discountPercent) || 0;
    const discountedPrice = item.isDiscounted ? price * (1 - discountPercent / 100) : price;
    return {
      ...item,
      price,
      discountPercent,
      discountedPrice,
      isInStock: (item.stockQuantity ?? 0) > 0,
    };
  }
}