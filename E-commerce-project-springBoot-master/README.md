# 🛒 FreshCart E-Commerce Platform

A production-ready, modernized full-stack e-commerce web application featuring a secure **Java Spring Boot 3.4 (Java 21)** REST API backend and a fully responsive **React.js (Vite + Tailwind CSS)** Single Page Application (SPA) frontend.

---

## 📸 Screenshots & Previews

*(Place your application screenshots in a `screenshots/` folder to display them here)*

### 1. Catalog Home Page & Search
![Catalog Home](screenshots/homepage.png)
*Modern, clean store catalog with dynamic brand/category sidebar filtering and real-time product search.*

### 2. High-Fidelity Checkout & Payment Simulators
![Checkout Flow](screenshots/checkout.png)
*Address selector cards, validation coupon code input, GST taxation metrics, UPI QR scanner, and secure Stripe credit card forms.*

### 3. Interactive Admin Dashboard
![Admin Dashboard](screenshots/admin_dashboard.png)
*Recharts analytics display indicating total revenue, orders count, stock inventory warnings, and live CRUD management tables.*

---

## ✨ Core Features

### 🛍️ Client / Customer Experience
* **Asynchronous AJAX Shopping Cart:** Add items, delete items, and adjust quantity numbers instantly without any page reloads.
* **Save For Later:** Easily switch products back and forth between your active shopping cart and a saved wishlist.
* **Address Book Manager:** Save multiple shipping locations (home, office, etc.) for quick selection during checkout.
* **Coupon & Promotions:** Validates code constraints (`DISCOUNT_20`, `FRESH50`) and dynamically calculates percentage savings.
* **Simulated Payment Gateways:** Experience UPI QR code scanning or secure credit card modals.
* **Product Reviews:** Submit ratings and comments directly on the product detail page.

### ⚙️ Store Administration (Admin Panel)
* **Sales Analytics Chart:** Renders weekly/daily sales volume and total revenues using Recharts.
* **Low Stock Alarm:** Automated warnings for inventory items dropping below critical levels (qty < 25).
* **Inventory CRUD Controls:** Programmatically add, edit, or delete Categories, Brands, and Products.

---

## 🛠️ Tech Stack

### Backend
* **Java 21**
* **Spring Boot 3.4.1**
* **Spring Security 6** (BCrypt hashing, CORS policies, CSRF compliance)
* **Spring Data JPA & Hibernate**
* **PostgreSQL** database engine
* **Maven** package manager

### Frontend
* **React 19**
* **Vite** (Next-gen bundling & HMR)
* **Tailwind CSS v4** (Utility-first styling plugin)
* **Recharts** (Visual dashboard metrics)
* **Lucide React** (Modern iconography)

---

## 🚀 Getting Started & Setup

### 1. Backend Database Setup
Make sure you have a running PostgreSQL server on port `5432` with a database named `ecommjava`.

Update the connection credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ecommjava
spring.datasource.username=your_postgres_username
spring.datasource.password=your_postgres_password
```

### 2. Run the Spring Boot Server
Launch the backend from the root directory:
```bash
# Clean, compile, and run the backend
.\mvnw.cmd spring-boot:run
```
*The REST APIs will run live on **`http://localhost:8080`**.*

### 3. Run the React Frontend
Navigate to the `frontend/` directory, install packages, and start the Vite server:
```bash
cd frontend
npm install
npm run dev
```
*The React user interface will launch live on **`http://localhost:5173`**.*

---

## 🔑 Demo Access Credentials

The database automatically seeds these standard users on initial startup if the database tables are clean:

* **Customer Account:**
  * **Username:** `lisa`
  * **Password:** `lisa`
* **Admin Account:**
  * **Username:** `admin`
  * **Password:** `admin`
