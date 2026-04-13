import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Medicine } from '../../models/medicine.model';
import { MedicineService } from '../../services/medicine';

@Component({
  selector: 'app-medicines',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicines.html'
})
export class MedicinesComponent implements OnInit {
  medicines: Medicine[] = [];
  loading = false;
  searchQuery = '';

  showAddModal = false;
  isEditing = false;
  currentMedicine: Partial<Medicine> = {};
  formErrors: Record<string, string> = {};
  submitting = false;
  serverError = '';

  constructor(private medicineService: MedicineService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.loading = true;
    this.medicineService.getMedicines({ search: this.searchQuery }).subscribe({
      next: (data) => {
        this.medicines = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load medicines', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openAddModal(): void {
    this.isEditing = false;
    this.formErrors = {};
    this.serverError = '';
    this.currentMedicine = {
      isDiscounted: false,
      discountPercent: 0,
      stockQuantity: 0,
      price: 0
    };
    this.showAddModal = true;
  }

  openEditModal(medicine: Medicine): void {
    this.isEditing = true;
    this.formErrors = {};
    this.serverError = '';
    this.currentMedicine = { ...medicine };
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.formErrors = {};
    this.serverError = '';
    this.submitting = false;
  }

  saveMedicine(): void {
    this.formErrors = {};
    this.serverError = '';

    // Validation
    if (!this.currentMedicine.name?.trim()) {
      this.formErrors['name'] = 'Medicine name is required';
    }
    if (!this.currentMedicine.generic?.trim()) {
      this.formErrors['generic'] = 'Generic name is required';
    }
    if (!this.currentMedicine.barcode?.trim()) {
      this.formErrors['barcode'] = 'Barcode is required';
    }
    if (!this.currentMedicine.brand?.trim()) {
      this.formErrors['brand'] = 'Brand is required';
    }
    if (!this.currentMedicine.price || this.currentMedicine.price <= 0) {
      this.formErrors['price'] = 'Price must be greater than 0';
    }
    if (this.currentMedicine.stockQuantity === undefined || this.currentMedicine.stockQuantity < 0) {
      this.formErrors['stockQuantity'] = 'Stock quantity cannot be negative';
    }
    if (this.currentMedicine.isDiscounted && (!this.currentMedicine.discountPercent || this.currentMedicine.discountPercent <= 0)) {
      this.formErrors['discountPercent'] = 'Discount must be greater than 0';
    }

    if (Object.keys(this.formErrors).length > 0) {
      this.cdr.markForCheck();
      return;
    }

    this.submitting = true;
    const payload = this.sanitizePayload(this.currentMedicine);

    if (this.isEditing && this.currentMedicine.id) {
      this.medicineService.updateMedicine(this.currentMedicine.id.toString(), payload).subscribe({
        next: () => {
          this.loadMedicines();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Failed to update medicine', err);
          this.serverError = err?.message || 'Failed to update medicine';
          this.submitting = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.medicineService.createMedicine(payload).subscribe({
        next: () => {
          this.loadMedicines();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Failed to create medicine', err);
          this.serverError = err?.message || 'Failed to create medicine';
          this.submitting = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  hasError(field: string): boolean {
    return !!this.formErrors[field];
  }

  private sanitizePayload(medicine: Partial<Medicine>): Partial<Medicine> {
    const { isInStock, discountedPrice, createdAt, updatedAt, ...payload } = medicine;
    return {
      name: payload.name,
      generic: payload.generic,
      barcode: payload.barcode,
      brand: payload.brand,
      price: payload.price,
      stockQuantity: payload.stockQuantity,
      isDiscounted: payload.isDiscounted,
      discountPercent: payload.discountPercent,
      imageUrl: payload.imageUrl ?? undefined
    };
  }

  trackByMedicineId(index: number, medicine: Medicine): any {
    return medicine.id || index;
  }
}
