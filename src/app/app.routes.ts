import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout';
import { PosComponent } from './components/pos/pos';
import { MedicinesComponent } from './components/medicines/medicines';
import { CustomersComponent } from './components/customers/customers';
import { OrdersComponent } from './components/orders/orders';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'pos', component: PosComponent },
      { path: 'medicines', component: MedicinesComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'orders', component: OrdersComponent },
      { path: '', redirectTo: 'pos', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];