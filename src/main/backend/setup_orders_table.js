const db = require("./db");

const createOrdersTable = `
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    buyer_email VARCHAR(150) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'Order Placed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createOrderItemsTable = `
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NULL,
    product_name VARCHAR(150) NOT NULL,
    seller_name VARCHAR(100) NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    item_total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
`;

db.query(createOrdersTable, (err) => {
    if (err) {
        console.error("Failed to create orders table:", err.message);
        process.exit(1);
    }
    console.log("orders table verified/created successfully!");

    db.query(createOrderItemsTable, (err2) => {
        if (err2) {
            console.error("Failed to create order_items table:", err2.message);
            process.exit(1);
        }
        console.log("order_items table verified/created successfully!");
        process.exit(0);
    });
});
