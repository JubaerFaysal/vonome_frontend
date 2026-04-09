import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environment/environment';
import { Medicine } from '../models/medicine.model';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private apiUrl = `${environment.apiUrl}/medicines`;

  constructor(private http: HttpClient) {}

  getMedicines(filters?: {
    search?: string;
    filter?: 'all' | 'in-stock' | 'out-of-stock' | 'discount';
    brand?: string;
  }): Observable<Medicine[]> {
    let params: any = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.filter) params.filter = filters.filter;
    if (filters?.brand) params.brand = filters.brand;

    return this.http.get<{ data: any[], meta: any }>(this.apiUrl, {
      params,
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    }).pipe(
      map(response => (response?.data ?? []).map((item: any) => this.mapMedicine(item)))
    );
  }

  private mapMedicine(item: any): Medicine {
    const price = parseFloat(item.price);
    const discountPercent = parseFloat(item.discountPercent);
    const discountedPrice = item.isDiscounted
      ? price * (1 - discountPercent / 100)
      : price;
    return {
      ...item,
      price,
      discountPercent,
      discountedPrice,
      isInStock: item.stockQuantity > 0
    };
  }

  getMedicine(id: string): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
  }

  createMedicine(medicine: Partial<Medicine>): Observable<Medicine> {
    return this.http.post<Medicine>(this.apiUrl, medicine);
  }

  updateMedicine(id: string, medicine: Partial<Medicine>): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/${id}`, medicine);
  }

  seedData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed`, {});
  }
}