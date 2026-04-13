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
    this.currentMedicine = { ...medicine };
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
  }

  saveMedicine(): void {
    // Filter out computed fields that shouldn't be sent to API
    const payload = this.sanitizePayload(this.currentMedicine);

    if (!payload.name || !payload.generic || !payload.barcode || !payload.brand) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.isEditing && this.currentMedicine.id) {
      this.medicineService.updateMedicine(this.currentMedicine.id.toString(), payload).subscribe({
        next: () => {
          this.loadMedicines();
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to update medicine', err);
          alert(`Failed to update medicine: ${err.message}`);
        }
      });
    } else {
      this.medicineService.createMedicine(payload).subscribe({
        next: () => {
          this.loadMedicines();
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to create medicine', err);
          alert(`Failed to create medicine: ${err.message}`);
        }
      });
    }
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
}
