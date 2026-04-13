import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;

  showAddModal = false;
  isEditing = false;
  currentCustomer: Partial<Customer> = {};

  constructor(private customerService: CustomerService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers(1, 50).subscribe({
      next: (data: any) => {
        console.log('API Response:', data);
        this.customers = data.data || [];
        this.loading = false;
        this.cdr.markForCheck();
        console.log('Loaded customers:', this.customers);
      },
      error: (err) => {
        console.error('Failed to load customers', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentCustomer = {
      type: 'individual',
      title: 'Mr',
    };
    this.showAddModal = true;
  }

  openEditModal(customer: Customer): void {
    this.isEditing = true;
    this.currentCustomer = { ...customer };
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
  }

  saveCustomer(): void {
    if (this.isEditing && this.currentCustomer.id) {
      this.customerService.updateCustomer(this.currentCustomer.id.toString(), this.currentCustomer).subscribe(() => {
        this.loadCustomers();
        this.closeModal();
      });
    } else {
      this.customerService.createCustomer(this.currentCustomer).subscribe(() => {
        this.loadCustomers();
        this.closeModal();
      });
    }
  }
}
