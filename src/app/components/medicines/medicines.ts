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
    if (this.isEditing && this.currentMedicine.id) {
      this.medicineService.updateMedicine(this.currentMedicine.id.toString(), this.currentMedicine).subscribe(() => {
        this.loadMedicines();
        this.closeModal();
      });
    } else {
      this.medicineService.createMedicine(this.currentMedicine).subscribe(() => {
        this.loadMedicines();
        this.closeModal();
      });
    }
  }
}
