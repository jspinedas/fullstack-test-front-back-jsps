# Fullstack Monorepo

Modern monorepo with npm workspaces including React, NestJS, and AWS CDK.

## 📋 Stack

### Frontend (`apps/web`)
- **React 18** - UI library
- **Vite** - Fast and modern bundler
- **Redux Toolkit** - State management
- **TypeScript** - Static typing
- **Jest** - Testing framework

### Backend (`apps/api`)
- **NestJS** - Enterprise Node.js framework
- **TypeScript** - Static typing
- **Jest** - Testing framework
- **Hexagonal Architecture** - Clean and maintainable code
  - `domain/` - Pure business logic (no framework dependencies)
  - `application/` - Use cases and ports (interfaces)
  - `infrastructure/` - Adapters (HTTP, DB, external services)

### Infrastructure (`infra/cdk`)
- **AWS CDK** - Infrastructure as Code
- **TypeScript** - Type-safe infrastructure definitions

---

## 📁 Project Structure

```
.
├── apps/
│   ├── api/                         # NestJS Backend
│   │   ├── src/
│   │   │   ├── domain/              # Domain layer (pure business logic)
│   │   │   ├── application/         # Application layer (use cases and ports)
│   │   │   ├── infrastructure/      # Infrastructure layer (adapters)
│   │   │   ├── health/
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── health.controller.spec.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   │
│   └── web/                         # React Frontend
│       ├── src/
│       │   ├── store/
│       │   │   └── index.ts         # Configured Redux store
│       │   ├── __tests__/
│       │   │   └── App.test.tsx     # Component smoke test
│       │   ├── App.tsx              # Main component
│       │   ├── App.css
│       │   ├── main.tsx
│       │   ├── setupTests.ts
│       │   └── vite-env.d.ts
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       └── jest.config.js
│
├── infra/
│   └── cdk/                         # AWS CDK Infrastructure
│       ├── bin/
│       │   └── cdk.ts               # CDK entry point
│       ├── lib/
│       │   └── cdk-stack.ts         # Main stack (empty for now)
│       ├── package.json
│       ├── tsconfig.json
│       └── cdk.json
│
├── package.json                     # Root workspace configuration
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── .gitignore
└── README.md
```


---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation

```bash
# Install all monorepo dependencies
npm install
```

### Development

#### Run Frontend (React + Vite)
```bash
npm run dev:web
```
- Opens at `http://localhost:5173`
- Hot Module Replacement enabled
- Shows "App initialized"
 
#### Run Backend (NestJS)
```bash
npm run dev:api
```
- Runs on `http://localhost:3000`
- Health check available at: `GET http://localhost:3000/health`
- Watch mode enabled

### Build

#### Compile Frontend
```bash
npm run build:web
```

#### Compile Backend
```bash
npm run build:api
```

#### Compile Everything
```bash
npm run build
```

### Testing

#### Run All Tests
```bash
npm run test
```

#### Run Tests with Coverage
```bash
npm run test:cov
```

Tests include:
- **Backend**: HealthController smoke test
- **Frontend**: App component smoke test

### Code Quality

#### Lint
```bash
npm run lint
```

#### Format with Prettier
```bash
npm run format
```

---

## 📐 Architecture Principles

### Hexagonal Architecture (Backend)

The backend follows the Hexagonal Architecture pattern (Ports & Adapters):

#### Domain Layer (`src/domain/`)
- Pure business logic **WITHOUT framework dependencies**
- Entities, value objects, and business rules
- Domain interfaces (ports)

#### Application Layer (`src/application/`)
- Use cases and orchestration logic
- Port definitions (abstract interfaces)
- DTOs and application-level responses
- Knows the domain but **NOT** HTTP/DB/frameworks

#### Infrastructure Layer (`src/infrastructure/`)
- HTTP controllers and routes
- Database clients and repositories
- Integrations with external services
- Framework-specific code (NestJS decorators, modules)
- Port implementations

---

## 📦 Workspaces

This project uses **npm workspaces** for monorepo management:

```json
{
  "workspaces": [
    "apps/web",
    "apps/api",
    "infra/cdk"
  ]
}
```

Run commands in a specific workspace:
```bash
npm run <script> --workspace=apps/web
npm run <script> --workspace=apps/api
npm run <script> --workspace=infra/cdk
```

---

## ✅ Health Check

Once the API is running, you can test it:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-04T12:00:00.000Z"
}
```

---

## 📋 Feature: Monorepo Bootstrap

### Implementation Scope

✅ **Monorepo Configuration**
- npm workspaces configured in root package.json
- ESLint and Prettier configured for the entire project
- Consolidated scripts for development, build, and testing

✅ **Frontend (`apps/web`)**
- React 18 with Vite bundler
- Redux Toolkit configured with empty store
- TypeScript configured
- Jest configured for testing
- Basic App component showing "App initialized"
- Component smoke test

✅ **Backend (`apps/api`)**
- NestJS with TypeScript
- Hexagonal structure ready (domain, application, infrastructure folders)
- HealthController with `/health` endpoint for testing
- Jest configured for testing
- HealthController smoke test

✅ **Infrastructure (`infra/cdk`)**
- AWS CDK configured with TypeScript
- Empty stack prepared for future resources
- Comments indicating resources to add in future features

### Out of Scope (NOT implemented)

❌ Database (DynamoDB, etc.)
❌ Payment provider integrations
❌ Checkout functionality
❌ Product page or catalog
❌ Real AWS deployment
❌ Functional business logic
❌ Real infrastructure adapters

### Next Steps

Future features will add:
- Payment provider integration
- Product catalog
- Checkout flow
- Database persistence
- Deployment pipelines

---

## 📋 Feature: Product Page

### What It Does

Displays a product with its stock in the UI, consuming a real backend endpoint. Includes a visible payment button without additional logic.

### Endpoint

- `GET /products/:id`
- Response 200:
```json
{
  "id": "product-1",
  "name": "Demo Product",
  "description": "Example product for local testing",
  "price": 20000,
  "stock": 12
}
```
- Response 404:
```json
{
  "message": "Product not found"
}
```

### Local Testing

1) Start backend:
```bash
npm run dev:api
```
2) Test endpoint:
```bash
curl http://localhost:3000/products/product-1
```
3) Start frontend:
```bash
npm run dev:web
```
4) Open `http://localhost:5173` in browser and verify:
- Product renders
- Stock is visible
- "Pay with credit card" button is visible
5) Test error (optional):
```bash
curl http://localhost:3000/products/unknown
```

### Tests and Commands

- Backend:
  - Unit test for `GetProductByIdUseCase`
  - Basic `ProductsController` test
  - Run: `npm run test --workspace=apps/api`
- Frontend:
  - Unit test for `productSlice` reducer
  - `ProductPage` render test
  - Run: `npm run test --workspace=apps/web`

---

## � Feature: Checkout Modal

### What It Does

Implements a checkout modal to capture credit card data (simulated with realistic structure) and delivery information, with complete validations and automatic card brand detection (VISA/MasterCard). Data is saved to Redux without processing payments.

### Captured Fields

#### Credit Card Section
- **Card Number**: Numeric field (13–19 digits)
- **Expiration Month**: Valid month (01–12)
- **Expiration Year**: Valid year (current year up to 15 years ahead)
- **CVC**: 3 or 4 digits
- **Cardholder Name**: Minimum 3 letters

#### Delivery Info Section
- **Full Name**: Minimum 3 letters
- **Phone**: 7–15 digits (optional special characters are stripped)
- **Address**: Minimum 3 characters
- **City**: Minimum 3 characters

### Validation Rules

- **All fields**: Required
- **Card Number**: 
  - Digits only (formatted numbers are accepted and cleaned)
  - Length: 13–19 digits
- **Expiration Month**: 1–12
- **Expiration Year**: 
  - Minimum: current year
  - Maximum: current year + 15
- **CVC**: 3–4 digits
- **Cardholder Name / Full Name**: Minimum 3 letters
- **Phone**: 7–15 digits (supports international formats; special characters are stripped)
- **Address / City**: Minimum 3 characters

All validations are performed when clicking "Continue". If errors exist, they are displayed in red below each field.


### Card Brand Detection (VISA/MasterCard)

Pure function `detectCardBrand(cardNumber)` identifies the card brand as the user types:
- **VISA**: Starts with 4
- **MASTERCARD**: Starts with 51–55 or 2221–2720
- **UNKNOWN**: Any other combination

A brand label appears in the top-right corner of the card number field (e.g., "VISA", "MASTERCARD").

### Redux State

**Slice**: `checkout`

```typescript
{
  paymentData: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    cardHolderName: string;
    brand: 'VISA' | 'MASTERCARD' | 'UNKNOWN';
  } | null;
  deliveryData: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  } | null;
  ui: {
    isCheckoutModalOpen: boolean;
  };
}
```

**Actions**:
- `openCheckoutModal()` - Opens the modal
- `closeCheckoutModal()` - Closes the modal without saving
- `saveCheckoutData({ paymentData, deliveryData })` - Saves data and closes the modal
- `clearCheckoutData()` - Clears all checkout data

### User Flow

1. User clicks the "Pay with credit card" button on ProductPage
2. Modal opens with empty form
3. As the user types in the card number field, the brand appears (VISA/MC/UNKNOWN)
4. User fills in both sections
5. When clicking "Continue":
   - All fields are validated
   - If errors exist, they appear in red below each field
   - If all fields are valid:
     - Data is saved to Redux
     - Modal closes
     - A confirmation message "Datos guardados" appears for 2 seconds
6. User can click "Cancel" to close the modal without saving

### Local Testing

1. Start the frontend:
```bash
npm run dev:web
```

2. Open `http://localhost:5173`

3. Verify:
   - Product and "Pay with credit card" button render
   - Clicking the button opens the modal with two visible sections
   - As you type in the card number field, the brand appears (VISA or MC)
   - Clicking "Continue" with empty fields shows validation errors
   - Fill with valid data:
     - Card: `4111111111111111` (VISA)
     - Month: `12`
     - Year: `2026` (or later)
     - CVC: `123`
     - Cardholder: `Juan Pérez García`
     - Full Name: `María López Rodríguez`
     - Phone: `3001234567` (7–15 digits, special chars stripped)
     - Address: `Cra 5 #45-30 Apto 201`
     - City: `Bogotá`
   - Clicking "Continue" shows "Datos guardados" and closes the modal
   - Clicking the button again reopens the modal with empty fields

### Tests and Commands

**Frontend** — Run: `npm run test --workspace=apps/web`

- **cardValidation.test.ts** (Unit tests):
  - `detectCardBrand()`: Correctly detects VISA, MasterCard, Unknown
  - Individual field validations: cardNumber, expMonth, expYear, cvc, cardHolderName, phone, fullName, address, city
  
- **checkoutSlice.spec.ts** (Reducer tests):
  - `openCheckoutModal()`: Opens modal
  - `closeCheckoutModal()`: Closes modal
  - `saveCheckoutData()`: Saves data and closes modal
  - `clearCheckoutData()`: Clears all checkout state

- **CheckoutModal.test.tsx** (Component/UI tests):
  - Renders modal, sections, and buttons
  - Shows validation errors when a field is missing
  - Accepts valid data and shows "Datos guardados"
  - Detects and displays card brand
  - Clears fields when reopened

**Total**: 12 tests for checkout feature (45 existing + 12 new = 57 tests)

### Created/Modified Files

**Created**:
- [apps/web/src/store/checkoutSlice.ts](apps/web/src/store/checkoutSlice.ts) - Redux slice
- [apps/web/src/components/CheckoutModal.tsx](apps/web/src/components/CheckoutModal.tsx) - Modal component
- [apps/web/src/components/CheckoutModal.css](apps/web/src/components/CheckoutModal.css) - Modal styles
- [apps/web/src/utils/cardValidation.ts](apps/web/src/utils/cardValidation.ts) - Validation functions and detectCardBrand
- [apps/web/src/__tests__/cardValidation.test.ts](apps/web/src/__tests__/cardValidation.test.ts) - Validation tests
- [apps/web/src/__tests__/checkoutSlice.spec.ts](apps/web/src/__tests__/checkoutSlice.spec.ts) - Reducer tests
- [apps/web/src/__tests__/CheckoutModal.test.tsx](apps/web/src/__tests__/CheckoutModal.test.tsx) - Component tests

**Modified**:
- [apps/web/src/store/index.ts](apps/web/src/store/index.ts) - Added checkoutReducer to store
- [apps/web/src/ProductPage.tsx](apps/web/src/ProductPage.tsx) - Integrated button dispatch and modal rendering

### Notes

- No localStorage persistence
- No backend calls to process payments
- No integration with real payment providers (Wompi, Stripe, etc.)
- The modal is provider-agnostic: it stores data in Redux without provider knowledge
- Ready for payment endpoint integration in a future feature

---

## � Feature: Summary & Backdrop

### What It Does

Implements a summary screen displaying order totals (product amount + base fee + delivery fee) with a Backdrop component. The "Pay" button simulates payment initiation by changing the state to "processing" without executing actual payment logic.

### Route

- **Path**: `/summary`
- Accessible after successfully saving checkout data via the modal
- On direct access without data, shows an incomplete checkout message with a link back to the product

### Calculation Rules

Totals are calculated using pure function `calculateTotals(productPrice)`:

```typescript
const BASE_FEE = 1500;
const DELIVERY_FEE = 5000;

// Returns:
{
  productAmount: number;      // Original product price
  baseFee: number;            // Fixed fee (1500)
  deliveryFee: number;        // Fixed fee (5000)
  total: number;              // Sum of all three
}
```

Example:
- Product: COP 20,000
- Base Fee: COP 1,500
- Delivery Fee: COP 5,000
- **Total: COP 26,500**

### Backdrop Component

Generic, reusable wrapper component:
- Renders a fixed-position dark overlay
- Centers card content
- Closes on overlay click (if `onClose` callback provided)
- Fully responsive design

Usage:
```tsx
<Backdrop onClose={handleClose}>
  <YourContent />
</Backdrop>
```

### UI: SummaryPage Component

**Displays**:
- Product name
- Product amount (formatted currency)
- Base fee (formatted currency)
- Delivery fee (formatted currency)
- **Total** (highlighted)

**Buttons**:
- **Back**: Returns to product page; resets payment intent state
- **Pay**: Simulates payment initiation (changes state to "processing" and shows "Processing..." text for 2 seconds)

**Guard Rails**:
- If user accesses `/summary` directly without checkout data:
  - Shows "Incomplete checkout" message
  - Provides "Back to product" button
  - Does NOT crash or cause errors

### Redux State Structure

**New Slice**: `paymentFlow`

```typescript
{
  step: 'product' | 'checkout' | 'summary' | 'final';
  paymentIntentStatus: 'idle' | 'processing';
}
```

**Actions**:
- `setStep(step)` - Updates current step
- `beginPayment()` - Sets status to 'processing'
- `resetPaymentIntent()` - Sets status back to 'idle'
- `resetPaymentFlow()` - Resets to initial state (product, idle)

### Navigation Flow

1. User completes checkout modal → saves data
2. Modal shows "Datos guardados" for 2 seconds
3. Automatically navigates to `/summary` and sets step to 'checkout'
4. Summary page displays totals
5. User clicks "Pay" → status changes to 'processing' → back button disabled
6. After 2 seconds (simulated), step moves to 'final' (placeholder for future payment processing)
7. User can click "Back" to return to `/` at any time (except during processing)

### Local Testing

1. Start frontend:
```bash
npm run dev:web
```

2. Navigate to `http://localhost:5173`:
   - See product with "Pay with credit card" button
   
3. Click "Pay with credit card":
   - Modal opens
   - Fill all fields with valid data (use example from Checkout Modal section)
   
4. Click "Continue":
   - Modal shows "Datos guardados"
   - After 2 seconds, page navigates to `/summary`
   
5. Verify summary page:
   - Product name and price shown
   - Base fee (COP 1,500) shown
   - Delivery fee (COP 5,000) shown
   - Total correctly calculated and highlighted
   - "Back" and "Pay" buttons visible and enabled
   
6. Click "Pay":
   - Button text changes to "Processing..."
   - Both buttons become disabled
   - After 2 seconds, state updates (step changes to 'final')
   
7. Click "Back" (before clicking "Pay"):
   - Returns to `/` (product page)
   - Payment state resets

8. Test incomplete checkout:
   - Open browser console and navigate directly to `http://localhost:5173/summary`
   - See "Incomplete checkout" message
   - Click "Back to product" to go back to `/`

### Tests and Commands

**Frontend** — Run: `npm run test --workspace=apps/web`

- **calculateTotals.test.ts** (Unit tests):
  - Calculates correct totals with various product prices
  - Returns all required fields (productAmount, baseFee, deliveryFee, total)
  - Handles zero and high values correctly
  
- **paymentFlowSlice.spec.ts** (Reducer tests):
  - `setStep()`: Correctly updates payment step
  - `beginPayment()`: Sets status to 'processing'
  - `resetPaymentIntent()`: Resets status to 'idle'
  - `resetPaymentFlow()`: Resets entire state to initial

- **SummaryPage.test.tsx** (Component/UI tests):
  - Renders summary with correct product and total data
  - Shows "Incomplete checkout" when data is missing
  - Disables buttons during processing
  - Displays "Processing..." text when status is 'processing'
  - Enables "Pay" button when idle

**Test Count**: 
- calculateTotals: 4 tests
- paymentFlowSlice: 5 tests
- SummaryPage: 6 tests
- **Total new**: 15 tests
- **Total in suite**: 73 tests (57 existing + 15 new + 1 removed duplicate)

### Created/Modified Files

**Created**:
- [apps/web/src/store/paymentFlowSlice.ts](apps/web/src/store/paymentFlowSlice.ts) - Redux slice for payment flow
- [apps/web/src/utils/calculateTotals.ts](apps/web/src/utils/calculateTotals.ts) - Pure calculation function
- [apps/web/src/components/Backdrop.tsx](apps/web/src/components/Backdrop.tsx) - Reusable Backdrop component
- [apps/web/src/SummaryPage.tsx](apps/web/src/SummaryPage.tsx) - Summary page with route
- [apps/web/src/__tests__/calculateTotals.test.ts](apps/web/src/__tests__/calculateTotals.test.ts) - Function tests
- [apps/web/src/__tests__/paymentFlowSlice.spec.ts](apps/web/src/__tests__/paymentFlowSlice.spec.ts) - Reducer tests
- [apps/web/src/__tests__/SummaryPage.test.tsx](apps/web/src/__tests__/SummaryPage.test.tsx) - Component tests

**Modified**:
- [apps/web/src/main.tsx](apps/web/src/main.tsx) - Added `<BrowserRouter>` wrapper
- [apps/web/src/App.tsx](apps/web/src/App.tsx) - Added Routes and `/summary` route
- [apps/web/src/store/index.ts](apps/web/src/store/index.ts) - Added paymentFlowReducer to store
- [apps/web/src/components/CheckoutModal.tsx](apps/web/src/components/CheckoutModal.tsx) - Added navigation to `/summary` on data save
- [apps/web/src/App.css](apps/web/src/App.css) - Added Backdrop and Summary styles
- [apps/web/src/__tests__/App.test.tsx](apps/web/src/__tests__/App.test.tsx) - Updated to use BrowserRouter
- [apps/web/src/__tests__/CheckoutModal.test.tsx](apps/web/src/__tests__/CheckoutModal.test.tsx) - Updated to use BrowserRouter
- [apps/web/package.json](apps/web/package.json) - Added `react-router-dom` dependency

### Notes

- No actual payment processing
- No transactionId generation
- No localStorage persistence
- Pure function `calculateTotals()` works independently of React/Redux
- Backdrop component is generic and reusable for future modals/overlays
- Step 'final' is placeholder; will be used for actual payment confirmation in future
- Payment flow state persists in Redux (no persistence across page reloads by design)

---

## �🛠 Troubleshooting

### Port already in use
- **Frontend**: Change `server.port` in [apps/web/vite.config.ts](apps/web/vite.config.ts)
- **Backend**: Change the `PORT` environment variable when running `npm run dev:api`

### Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tests failing
```bash
# Make sure you're in the workspace root
cd e:\Laboral\Wompi\fullstack-test-front-back-jsps
npm run test
```

---