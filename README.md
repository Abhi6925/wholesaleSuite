# Wholesale Inventory and Billing Suite

A secure, multi-tenant MERN-stack web application designed for wholesale distributors to manage products, suppliers, customers, and billing/invoice transactions. It supports local JSON file database fallback for easy setup as well as full MongoDB Atlas integration.

---

## Key Features

- **Multi-Tenant Architecture**: Complete data isolation. User data (products, suppliers, customers, invoices, and audit logs) is private by default and visible only to the account that created it.
- **Supplier Directory**: Manage suppliers, store contact details (emails, phone numbers, addresses), and associate them with products.
- **Product & Stock Catalog**: Keep track of item names, SKU codes, categories, purchase prices, selling prices, and real-time stock levels.
- **Billing Checkout**: Generate GST-compliant invoices by selecting a customer and entering product quantities. Checks stock levels sequentially, decreases inventory, and logs stock movements.
- **Analytics Dashboard**: Real-time business metrics including catalog counters, gross revenue, active buyers, Chart.js visual sales analytics, low-stock alerts, and recent transactions.
- **Auditable Stock Logs**: Full tracking of stock increases, manual reductions, and billing checkouts.
- **Hybrid Storage Layer**: Uses MongoDB/Mongoose in cloud environments and automatically falls back to local JSON-based file storage (`database_files/*.json`) if no connection string is provided.

---

## Tech Stack

### Backend
- **Node.js** with **Express**
- **MongoDB** / **Mongoose** (for cloud database)
- **JSON File Database Emulator** (for local serverless/no-db environments)
- **JWT (JsonWebToken)** & **bcryptjs** (for security & password hashing)

### Frontend
- **React 19** with **Vite**
- **Tailwind CSS v4** (for premium modern styling)
- **Chart.js** & **React-Chartjs-2** (for visual analytics)
- **Lucide React** (for modern UI icons)
- **React Router v7** (for client-side routing)

---

## Security Architecture

1. **Authentication & Session Tokens**: Passwords are encrypted using `bcryptjs`. Session tokens are created using JWT and sent in the `Authorization` header on every request.
2. **Access Control**: Routes are guarded. Middleware validates the JWT and injects `req.user` into incoming requests.
3. **Data Scope**: All CRUD routes query documents matching `{ userId: req.user._id }`.
4. **Relational Authorization**: Checks ensure that a user cannot create a product using another user's `supplierId` or create an invoice with another user's `customerId` or `productId`.
5. **Scoped Uniqueness**: SKU codes and invoice numbers use compound unique indices (`{ code: 1, userId: 1 }`), preventing conflicts between different tenant workspaces.

---

## Local Setup

### Prerequisites
- Node.js (version 18 or higher)

### Installation
1. Clone the repository and navigate to the project root directory.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory (you can copy `.env.example`):
   ```env
   # Leave MONGODB_URI empty to fall back to the built-in local JSON file database
   MONGODB_URI=""
   JWT_SECRET="your_secure_secret_key"
   PORT=3000
   ```
4. Start the development server (runs both frontend and express middleware):
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## Deployment

### Vercel Deployment
The application includes a `vercel.json` and `api/index.js` serverless function configuration.
1. Connect your repository to Vercel.
2. Configure the following environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
3. Vercel will build the frontend assets using `npm run build` and route `/api/*` requests through the serverless function.

