const db = require("./db");

const createProductsTable = `
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
);
`;

const initialProducts = [
    {
        id: 1,
        name: "Arden Lounge Chair",
        category: "Living Room",
        price: 18500,
        seller_name: "Urban Wood Studio",
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
        rating: 4.7,
        reviews_count: 88,
        stock: 14,
        description: "Ergonomic study desk with dedicated cable management.",
        image_url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80"
    }
];

db.query(createProductsTable, (err) => {
    if (err) {
        console.error("Products table creation failed:", err.message);
        process.exit(1);
    }
    console.log("products table created or verified!");

    db.query("SELECT COUNT(*) AS count FROM products", (countErr, countRows) => {
        if (countErr) {
            console.error("Count check failed:", countErr.message);
            process.exit(1);
        }

        if (countRows[0].count === 0) {
            const values = initialProducts.map(p => [
                p.id, p.name, p.category, p.price, p.seller_name, 'seller@gmail.com',
                p.stock, p.description, p.image_url, p.rating, p.reviews_count
            ]);

            const insertSql = `
                INSERT INTO products 
                (id, name, category, price, seller_name, seller_email, stock, description, image_url, rating, reviews_count)
                VALUES ?
            `;

            db.query(insertSql, [values], (seedErr) => {
                if (seedErr) {
                    console.error("Seeding products failed:", seedErr.message);
                    process.exit(1);
                }
                console.log("Seeded initial products into MySQL successfully!");
                process.exit(0);
            });
        } else {
            console.log(`products table already contains ${countRows[0].count} products.`);
            process.exit(0);
        }
    });
});
