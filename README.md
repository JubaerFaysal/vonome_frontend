# Vonome Frontend - POS System

A modern Point of Sale (POS) application built with Angular 21 offering a comprehensive solution for retail and pharmacy management. This application provides an intuitive interface for managing sales, inventory, customers, and orders.

## 📋 Overview

Vonome is a full-featured POS system designed to streamline retail operations with real-time inventory management, customer records, order tracking, and payment processing. Built with modern Angular standalone components and Tailwind CSS for a responsive, user-friendly experience.

## ✨ Key Features

- **Point of Sale (POS)**: Intuitive sales interface for quick transactions
- **Inventory Management**: Manage medicines and products with real-time stock updates
- **Customer Management**: Maintain customer profiles and purchase history
- **Shopping Cart**: Add items to cart with quantity management and price calculations
- **Order Management**: Track and manage customer orders
- **Payment Processing**: Secure payment handling and transaction management
- **Receipt Generation**: Generate and print receipts for completed transactions
- **Responsive Design**: Mobile-friendly interface powered by Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: [Angular 21.2.0](https://angular.io) (Standalone Components)
- **Language**: TypeScript 5.9.2
- **Styling**: [Tailwind CSS 4.1.12](https://tailwindcss.com)
- **Testing**: [Vitest 4.0.8](https://vitest.dev/)
- **Build Tool**: Angular CLI 21.2.6
- **Package Manager**: Yarn 1.22.22
- **State Management**: RxJS 7.8.0

## 📁 Project Structure

```
vonome_frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── pos/              # Point of Sale component
│   │   │   ├── medicines/        # Medicine/Product management
│   │   │   ├── customers/        # Customer management
│   │   │   ├── orders/           # Order management
│   │   │   ├── payment/          # Payment processing
│   │   │   ├── receipt/          # Receipt generation
│   │   │   ├── add-customer/     # Customer creation
│   │   │   ├── layout/           # Layout/Navigation
│   │   │   └── shared/           # Shared components
│   │   ├── models/
│   │   │   ├── customer.model.ts # Customer data model
│   │   │   ├── medicine.model.ts # Medicine/Product model
│   │   │   └── order.model.ts    # Order data model
│   │   ├── services/
│   │   │   ├── cart.ts           # Shopping cart service
│   │   │   ├── customer.ts       # Customer service
│   │   │   ├── medicine.ts       # Medicine service
│   │   │   └── order.ts          # Order service
│   │   ├── app.routes.ts         # Application routing
│   │   └── app.ts                # Root component
│   ├── environment/              # Environment configuration
│   └── main.ts                   # Application entry point
├── public/                       # Static assets
├── app_screenshots/              # Application screenshots
├── angular.json                  # Angular CLI configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── package.json                  # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn 1.22.22 or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vonome_frontend
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```
   Or with npm:
   ```bash
   npm install
   ```

### Development Server

Start the development server:

```bash
npm start
```
Or:
```bash
ng serve
```

Once running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any source files.

### Building for Production

Build the project for deployment:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## 🧪 Testing

### Running Unit Tests

Execute unit tests with [Vitest](https://vitest.dev/):

```bash
npm test
```

### Code Scaffolding

Generate new components using Angular CLI:

```bash
ng generate component component-name
```

For a complete list of available schematics:
```bash
ng generate --help
```

## 📸 Screenshots

### Transaction Flow
![Transaction Flow](./app_screenshots/Screenshot%202026-04-13%20at%209.57.13%E2%80%AFPM.png)

### Customer Management
![Customer Management](./app_screenshots/Screenshot%202026-04-13%20at%209.58.15%E2%80%AFPM.png)

### Order Processing
![Order Processing](./app_screenshots/Screenshot%202026-04-13%20at%209.58.31%E2%80%AFPM.png)

### Payment Interface
![Payment Interface](./app_screenshots/Screenshot%202026-04-13%20at%209.58.44%E2%80%AFPM.png)

### Receipt Display
![Receipt Display](./app_screenshots/Screenshot%202026-04-13%20at%209.58.55%E2%80%AFPM.png)

### Order Confirmation
![Order Confirmation](./app_screenshots/Screenshot%202026-04-13%20at%209.59.03%E2%80%AFPM.png)

### Inventory Management
![Inventory Management](./app_screenshots/Screenshot%202026-04-13%20at%209.59.13%E2%80%AFPM.png)

### Final Summary
![Summary](./app_screenshots/Screenshot%202026-04-13%20at%209.59.34%E2%80%AFPM.png)

## 🏗️ Architecture

The application follows Angular best practices with:

- **Standalone Components**: Modern Angular architecture using standalone components
- **Modular Services**: Separation of concerns with dedicated services for each domain
- **Typed Models**: Strong typing with TypeScript models for customers, medicines, and orders
- **Reactive State**: RxJS observables for state management
- **Component-Based UI**: Reusable, maintainable component structure

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run watch` | Watch mode for development |
| `ng generate component [name]` | Create new component |

## 📦 Dependencies

### Core Dependencies
- `@angular/core`: Core Angular framework
- `@angular/common`: Common Angular directives and pipes
- `@angular/forms`: Form handling and validation
- `@angular/router`: Routing and navigation
- `rxjs`: Reactive programming library
- `tailwindcss`: Utility-first CSS framework

### Development Dependencies
- `typescript`: Programming language
- `vitest`: Unit testing framework
- `prettier`: Code formatter
- `postcss`: CSS processing

## 📝 Development Notes

- The application uses standalone components, eliminating the need for NgModule declarations
- Tailwind CSS provides responsive design utilities
- Services are organized by feature (customer, medicine, order, cart)
- All components include TypeScript interfaces and type safety
- The application is fully responsive and mobile-optimized



---

