import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-customer.html'
})
export class AddCustomerComponent {
  customerForm: FormGroup;
  loading = false;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Customer>();

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService
  ) {
    this.customerForm = this.fb.group({
      type: ['individual', Validators.required],
      title: ['Mr.', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      email: ['', [Validators.email]],
      billingAddress: ['']
    });
  }

  get f() { return this.customerForm.controls; }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onSubmit() {
    if (this.customerForm.invalid) {
      Object.keys(this.customerForm.controls).forEach(key => {
        this.customerForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.loading = true;
    const formValue = this.customerForm.value;
    const data = {
      ...formValue,
      phone: '+880' + formValue.phone
    };
    
    this.customerService.createCustomer(data).subscribe({
      next: (customer: Customer) => {
        this.saved.emit(customer);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error creating customer:', err);
        alert(err.error?.message || 'Failed to create customer. Please try again.');
        this.loading = false;
      }
    });
  }
}