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
  error = '';

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
    // Strip +880 prefix from phone for display
    const phone = customer.phone?.replace(/^\+880/, '') || '';
    this.currentCustomer = { ...customer, phone };
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
  }

  saveCustomer(): void {
    if (this.isEditing && this.currentCustomer.id) {
      const phone = this.currentCustomer.phone;
      // Ensure phone has +880 prefix
      const formattedPhone = phone && !phone.startsWith('+880') ? `+880${phone}` : phone;
      
      const updateData = {
        type: this.currentCustomer.type,
        title: this.currentCustomer.title,
        name: this.currentCustomer.name,
        displayName: this.currentCustomer.displayName,
        phone: formattedPhone,
        email: this.currentCustomer.email || '',
        billingAddress: this.currentCustomer.billingAddress || '',
      };

      console.log('Updating customer with ID:', this.currentCustomer.id);
      console.log('Update payload:', updateData);

      this.customerService.updateCustomer(this.currentCustomer.id.toString(), updateData).subscribe({
        next: () => {
          console.log('Customer updated successfully');
          this.loadCustomers();
          this.closeModal();
          this.error = '';
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.error = err?.message || 'Failed to update customer';
          this.cdr.markForCheck();
        }
      });
    } else {
      const phone = this.currentCustomer.phone;
      const formattedPhone = phone && !phone.startsWith('+880') ? `+880${phone}` : phone;
      
      const createData = {
        type: this.currentCustomer.type,
        title: this.currentCustomer.title,
        name: this.currentCustomer.name,
        displayName: this.currentCustomer.displayName,
        phone: formattedPhone,
        email: this.currentCustomer.email || '',
        billingAddress: this.currentCustomer.billingAddress || '',
      };

      console.log('Creating customer with payload:', createData);

      this.customerService.createCustomer(createData).subscribe({
        next: () => {
          console.log('Customer created successfully');
          this.loadCustomers();
          this.closeModal();
          this.error = '';
        },
        error: (err) => {
          console.error('Create failed:', err);
          this.error = err?.message || 'Failed to create customer';
          this.cdr.markForCheck();
        }
      });
    }
  }
}
