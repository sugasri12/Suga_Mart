# 🛋️ SUGA'S MART - Full-Stack Furniture Marketplace

A full-stack furniture marketplace web application with buyer, seller, and administrator portals backed by Node.js, Express, and MySQL database.

---

## ✨ Features

- **Buyer Portal**: Browse furniture catalog, live product filtering & search, cart & checkout, customer reviews, profile management with delivery address persistence in MySQL, and live shipment tracking.
- **Seller Portal**: Add, edit, and delete furniture products, manage inventory/stock, and update order statuses (Placed, Packed, Shipped, Delivered).
- **Admin Portal**: Marketplace overview reports, revenue analytics, user & seller account standing moderation (Active/Blocked), customer review moderation (Approve/Delete).
- **Cross-Platform & Mobile Ready**: Responsive UI accessible on desktop browsers and mobile devices over local Wi-Fi.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Host-agnostic API base configuration)
- **Backend**: Node.js, Express.js, CORS, Bcrypt.js
- **Database**: MySQL (tables: `users`, `products`, `orders`, `order_items`, `product_reviews`)

---

## 🚀 Getting Started

### 1. Database Setup
Create MySQL database `suga_mart` and configure credentials in `src/main/backend/db.js`:
```sql
CREATE DATABASE IF NOT EXISTS suga_mart;
```

### 2. Backend Setup & Run
```bash
cd src/main/backend
npm install
node --watch server.js
```

### 3. Open Application
- **On Desktop**: Open `http://localhost:5000`
- **On Mobile**: Open `http://<YOUR_LOCAL_IP>:5000` (ensure mobile is connected to the same Wi-Fi)

---

## 📄 License
MIT
