const db = require("./db");
const bcrypt = require("bcryptjs");

const initialProducts = [
    {
        id: 1,
        name: "Arden Lounge Chair",
        category: "Living Room",
        price: 18500,
        seller_name: "Urban Wood Studio",
        seller_email: "seller@gmail.com",
        rating: 4.8,
        reviews_count: 124,
        stock: 10,
        description: "Elegant lounge chair designed for modern living spaces.",
        image_url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 2,
        name: "Comfort Sofa Set",
        category: "Living Room",
        price: 42500,
        seller_name: "Classic Comfort Furniture",
        seller_email: "seller@gmail.com",
        rating: 4.7,
        reviews_count: 98,
        stock: 5,
        description: "Comfortable sofa set with a premium contemporary finish.",
        image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 3,
        name: "Velora Accent Chair",
        category: "Living Room",
        price: 16400,
        seller_name: "Elegant Living Store",
        seller_email: "seller@gmail.com",
        rating: 4.6,
        reviews_count: 76,
        stock: 12,
        description: "Stylish accent chair perfect for cozy corners.",
        image_url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 4,
        name: "Luna Coffee Table",
        category: "Living Room",
        price: 12900,
        seller_name: "Urban Wood Studio",
        seller_email: "seller@gmail.com",
        rating: 4.5,
        reviews_count: 64,
        stock: 15,
        description: "Minimal coffee table with a warm wooden finish.",
        image_url: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 5,
        name: "Serene Queen Bed",
        category: "Bedroom",
        price: 32000,
        seller_name: "Modern Home Furnishings",
        seller_email: "seller@gmail.com",
        rating: 4.9,
        reviews_count: 143,
        stock: 6,
        description: "Elegant queen bed designed for comfortable bedrooms.",
        image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 6,
        name: "Oakline Bed Frame",
        category: "Bedroom",
        price: 28500,
        seller_name: "Classic Comfort Furniture",
        seller_email: "seller@gmail.com",
        rating: 4.7,
        reviews_count: 91,
        stock: 8,
        description: "Strong wooden bed frame with a timeless appearance.",
        image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 7,
        name: "Haven 6-Seater Dining Table",
        category: "Dining",
        price: 26500,
        seller_name: "Urban Wood Studio",
        seller_email: "seller@gmail.com",
        rating: 4.8,
        reviews_count: 110,
        stock: 7,
        description: "Spacious wooden dining table crafted for family gatherings.",
        image_url: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80"
    },
    {
        id: 8,
        name: "Minimalist Study Desk",
        category: "Study Room",
        price: 14200,
        seller_name: "Urban Wood Studio",
        seller_email: "seller@gmail.com",
        rating: 4.7,
        reviews_count: 88,
        stock: 14,
        description: "Ergonomic study desk with dedicated cable management.",
        image_url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80"
    }
];

function queryAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

async function initDatabase() {
    try {
        // 1. Users table
        await queryAsync(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role ENUM('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(20) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                city VARCHAR(100) DEFAULT NULL,
                address TEXT,
                status VARCHAR(20) DEFAULT 'Active'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 2. Products table
        await queryAsync(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                category VARCHAR(50) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                seller_name VARCHAR(100) NOT NULL DEFAULT 'Urban Wood Studio',
                seller_email VARCHAR(150) NULL,
                stock INT NOT NULL DEFAULT 10,
                description TEXT NOT NULL,
                image_url TEXT NULL,
                rating DECIMAL(2, 1) DEFAULT 4.5,
                reviews_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 3. Orders table
        await queryAsync(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 4. Order Items table
        await queryAsync(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 5. Product Reviews table
        await queryAsync(`
            CREATE TABLE IF NOT EXISTS product_reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                customer_name VARCHAR(50) NOT NULL,
                rating TINYINT NOT NULL,
                review_text VARCHAR(1000) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'Published'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // 6. Seed products if empty
        const productRows = await queryAsync("SELECT COUNT(*) AS count FROM products");
        if (productRows[0].count === 0) {
            const values = initialProducts.map(p => [
                p.id, p.name, p.category, p.price, p.seller_name, p.seller_email,
                p.stock, p.description, p.image_url, p.rating, p.reviews_count
            ]);
            await queryAsync(`
                INSERT INTO products 
                (id, name, category, price, seller_name, seller_email, stock, description, image_url, rating, reviews_count)
                VALUES ?
            `, [values]);
            console.log("🌱 Seeded initial products into MySQL database.");
        }

        // 7. Seed default admin & test accounts if users table is empty
        const userRows = await queryAsync("SELECT COUNT(*) AS count FROM users");
        if (userRows[0].count === 0) {
            const defaultPassword = await bcrypt.hash("admin123", 10);
            await queryAsync(`
                INSERT INTO users (role, name, email, phone, password_hash, status)
                VALUES 
                ('admin', 'SUGA MART Admin', 'admin@sugamart.com', '9876543210', ?, 'Active'),
                ('seller', 'Urban Wood Studio', 'seller@gmail.com', '9876543211', ?, 'Active'),
                ('buyer', 'Demo Buyer', 'buyer@sugamart.com', '9876543212', ?, 'Active')
            `, [defaultPassword, defaultPassword, defaultPassword]);
            console.log("🌱 Seeded default admin/seller/buyer accounts into database.");
        }

        console.log("✅ Database tables verified and ready.");
    } catch (err) {
        console.error("⚠️ Database auto-initialization error:", err.message);
    }
}

module.exports = initDatabase;
