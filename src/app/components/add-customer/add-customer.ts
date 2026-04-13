import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-customer.html',
})
export class AddCustomerComponent implements OnInit, OnDestroy {
  @Input() customer?: Customer;
  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly saved = new EventEmitter<Customer>();

  readonly customerForm: FormGroup;
  loading = false;
  serverError = '';
  isEditing = false;
  formSubmitted = false;

  private readonly subs = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly customerService: CustomerService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.customerForm = this.fb.group({
      type: ['individual', Validators.required],
      title: ['Mr.', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      billingAddress: ['', Validators.maxLength(200)],
    });
  }

  ngOnInit(): void {
    if (this.customer) {
      this.isEditing = true;
      const phone = this.customer.phone?.replace(/^\+880/, '') || '';
      this.customerForm.patchValue({
        type: this.customer.type,
        title: this.customer.title,
        name: this.customer.name,
        displayName: this.customer.displayName,
        phone,
        email: this.customer.email || '',
        billingAddress: this.customer.billingAddress || '',
      });
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get f(): Record<string, AbstractControl> {
    return this.customerForm.controls;
  }

  hasError(field: string): boolean {
    const ctrl = this.f[field];
    return !!(ctrl?.touched && ctrl?.errors) || !!(this.formSubmitted && ctrl?.errors);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  closeModal(): void {
    this.formSubmitted = false;
    this.serverError = '';
    this.close.emit();
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.formSubmitted = true;
      Object.values(this.customerForm.controls).forEach(c => c.markAsTouched());
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.serverError = '';
    const { phone, ...rest } = this.customerForm.value;
    const formattedPhone = phone.startsWith('+880') ? phone : `+880${phone}`;

    if (this.isEditing && this.customer?.id) {
      this.subs.add(
        this.customerService.updateCustomer(this.customer.id, { ...rest, phone: formattedPhone }).subscribe({
          next: customer => {
            this.loading = false;
            this.saved.emit(customer);
            this.closeModal();
            this.cdr.markForCheck();
          },
          error: (err: Error) => {
            this.serverError = err.message;
            this.loading = false;
            this.cdr.markForCheck();
          },
        })
      );
    } else {
      this.subs.add(
        this.customerService.createCustomer({ ...rest, phone: formattedPhone }).subscribe({
          next: customer => {
            this.loading = false;
            this.saved.emit(customer);
            this.closeModal();
            this.cdr.markForCheck();
          },
          error: (err: Error) => {
            this.serverError = err.message;
            this.loading = false;
            this.cdr.markForCheck();
          },
        })
      );
    }
  }
}