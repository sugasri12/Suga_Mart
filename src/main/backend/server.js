
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const os = require("os");
const db = require("./db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve frontend static files from webapp
const webappPath = path.join(__dirname, "../webapp");
app.use(express.static(webappPath));

app.get("/", (req, res) => {
    if (req.accepts("html")) {
        return res.sendFile(path.join(webappPath, "index.html"));
    }
    res.json({
        message: "SUGA'S MART Backend is running!"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "online",
        message: "SUGA'S MART Backend is running!"
    });
});

app.get("/api/db-test", (req, res) => {
    db.query("SELECT 1 AS result", (err, rows) => {
        if (err) {
            console.error("Database test failed:", err.message);
            return res.status(500).json({
                success: false,
                message: "Database connection test failed"
            });
        }

        res.json({
            success: true,
            message: "SUGA'S MART database connected successfully!",
            result: rows[0].result
        });
    });
});


// Get review summaries (average rating & count) across all products
app.get("/api/reviews/summary/all", (req, res) => {
    const sql = `
        SELECT product_id,
               COUNT(*) AS total_reviews,
               ROUND(AVG(rating), 1) AS average_rating
        FROM product_reviews
        GROUP BY product_id
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Error fetching review summaries:", err.message);
            return res.status(500).json({
                success: false,
                message: "Could not fetch review summaries"
            });
        }

        res.json({
            success: true,
            summaries: rows
        });
    });
});

app.get("/api/reviews/:productId", (req, res) => {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId < 1 || productId > 300) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID. Must be between 1 and 300."
        });
    }

    const sql = `
        SELECT id, product_id, customer_name, rating,
               review_text, created_at
        FROM product_reviews
        WHERE product_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [productId], (err, reviews) => {
        if (err) {
            console.error("Error fetching reviews:", err.message);
            return res.status(500).json({
                success: false,
                message: "Could not fetch reviews"
            });
        }

        const totalReviews = reviews.length;

        const averageRating = totalReviews > 0
            ? Number((
                reviews.reduce((sum, review) => sum + review.rating, 0)
                / totalReviews
            ).toFixed(1))
            : 0;

        res.json({
            success: true,
            productId,
            totalReviews,
            averageRating,
            reviews
        });
    });
});

app.post("/api/reviews", (req, res) => {
    const { productId, customerName, rating, reviewText } = req.body;

    const id = Number(productId);
    const stars = Number(rating);
    const name = typeof customerName === "string"
        ? customerName.trim()
        : "";
    const review = typeof reviewText === "string"
        ? reviewText.trim()
        : "";

    if (
        !Number.isInteger(id) || id < 1 || id > 300 ||
        !Number.isInteger(stars) || stars < 1 || stars > 5 ||
        name.length < 1 || name.length > 50 ||
        review.length < 1 || review.length > 1000
    ) {
        return res.status(400).json({
            success: false,
            message: "Please provide valid review details (product ID between 1 and 300, rating 1-5)."
        });
    }

    const sql = `
        INSERT INTO product_reviews
        (product_id, customer_name, rating, review_text)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [id, name, stars, review], (err, result) => {
        if (err) {
            console.error("Error saving review:", err.message);
            return res.status(500).json({
                success: false,
                message: "Could not save review."
            });
        }

        res.status(201).json({
            success: true,
            message: "Review saved successfully!",
            reviewId: result.insertId
        });
    });
});

// Get all reviews for Admin moderation
app.get("/api/reviews", (req, res) => {
    const sql = `
        SELECT r.id, r.product_id, IFNULL(p.name, 'Furniture Product') AS product_name,
               r.customer_name, r.rating, r.review_text,
               IFNULL(r.status, 'Published') AS status, r.created_at
        FROM product_reviews r
        LEFT JOIN products p ON r.product_id = p.id
        ORDER BY r.created_at DESC
    `;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Fetch all reviews error:", err.message);
            return res.status(500).json({ success: false, message: "Could not fetch reviews" });
        }
        res.json({ success: true, totalReviews: rows.length, reviews: rows });
    });
});

// Update review status (Approve / Moderate)
app.put("/api/reviews/:id/status", (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: "Invalid review ID." });
    }
    const cleanStatus = typeof status === "string" ? status.trim() : "Approved";
    db.query("UPDATE product_reviews SET status = ? WHERE id = ?", [cleanStatus, id], (err, result) => {
        if (err) {
            console.error("Update review error:", err.message);
            return res.status(500).json({ success: false, message: "Failed to update review status." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }
        res.json({ success: true, message: `Review status updated to '${cleanStatus}' in MySQL!`, reviewId: id, status: cleanStatus });
    });
});

// Delete review (Admin)
app.delete("/api/reviews/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: "Invalid review ID." });
    }
    db.query("DELETE FROM product_reviews WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Delete review error:", err.message);
            return res.status(500).json({ success: false, message: "Failed to delete review from MySQL." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }
        res.json({ success: true, message: "Review deleted successfully from MySQL!", reviewId: id });
    });
});

/* =====================================================
   AUTHENTICATION & USER ACCOUNTS (BUYER / SELLER / ADMIN)
   ===================================================== */

// REGISTER
app.post("/api/auth/register", async (req, res) => {
    try {
        const { role, name, email, phone, password } = req.body;

        const userRole = (role === "seller" || role === "admin") ? role : "buyer";
        const cleanName = typeof name === "string" ? name.trim() : "";
        const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const cleanPhone = typeof phone === "string" ? phone.trim() : "";
        const cleanPassword = typeof password === "string" ? password : "";

        // Validation
        if (cleanName.length < 2 || cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid name (2-100 characters)."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (!/^[0-9]{10}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be exactly 10 digits."
            });
        }

        if (cleanPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        // Check if email is already registered in MySQL
        db.query("SELECT id FROM users WHERE email = ?", [cleanEmail], async (err, existing) => {
            if (err) {
                console.error("Database check error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Database error during registration."
                });
            }

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "An account with this email already exists. Please login instead."
                });
            }

            // Hash password securely with bcrypt
            const passwordHash = await bcrypt.hash(cleanPassword, 10);

            const insertSql = `
                INSERT INTO users (role, name, email, phone, password_hash)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(insertSql, [userRole, cleanName, cleanEmail, cleanPhone, passwordHash], (insertErr, result) => {
                if (insertErr) {
                    console.error("User registration error:", insertErr.message);
                    return res.status(500).json({
                        success: false,
                        message: "Could not create account in database."
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "Account created successfully!",
                    user: {
                        id: result.insertId,
                        role: userRole,
                        name: cleanName,
                        email: cleanEmail,
                        phone: cleanPhone
                    }
                });
            });
        });
    } catch (error) {
        console.error("Register catch error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error occurred during registration."
        });
    }
});

// LOGIN
app.post("/api/auth/login", (req, res) => {
    try {
        const { email, password, expectedRole } = req.body;

        const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const cleanPassword = typeof password === "string" ? password : "";

        if (!cleanEmail || !cleanPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password."
            });
        }

        const sql = "SELECT id, role, name, email, phone, password_hash FROM users WHERE email = ?";
        db.query(sql, [cleanEmail], async (err, rows) => {
            if (err) {
                console.error("Database login query error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Database error during login."
                });
            }

            if (rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }

            const user = rows[0];

            // Verify password using bcrypt
            const passwordMatch = await bcrypt.compare(cleanPassword, user.password_hash);
            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }

            // Verify role if specified (e.g. prevent buyer logging in as admin)
            if (expectedRole && user.role !== expectedRole) {
                return res.status(403).json({
                    success: false,
                    message: `This account is registered as a ${user.role}. Please log in from the ${user.role} portal.`
                });
            }

            res.json({
                success: true,
                message: "Login successful!",
                user: {
                    id: user.id,
                    role: user.role,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            });
        });
    } catch (error) {
        console.error("Login catch error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error occurred during login."
        });
    }
});

// FORGOT PASSWORD / PASSWORD RESET
app.post("/api/auth/forgot-password", (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        const cleanPass = typeof newPassword === "string" ? newPassword : "";
        const cleanConfirm = typeof confirmPassword === "string" ? confirmPassword : "";

        if (!cleanEmail) {
            return res.status(400).json({
                success: false,
                message: "Please enter your registered email address."
            });
        }

        db.query("SELECT id, name, role FROM users WHERE email = ?", [cleanEmail], async (err, rows) => {
            if (err) {
                console.error("Forgot password query error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Database error during password reset."
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No account found with this email address."
                });
            }

            // If a new password is provided, validate and update it in MySQL
            if (cleanPass) {
                if (cleanPass.length < 6) {
                    return res.status(400).json({
                        success: false,
                        message: "New password must be at least 6 characters long."
                    });
                }

                if (cleanPass !== cleanConfirm) {
                    return res.status(400).json({
                        success: false,
                        message: "Passwords do not match."
                    });
                }

                const newHash = await bcrypt.hash(cleanPass, 10);
                return db.query("UPDATE users SET password_hash = ? WHERE email = ?", [newHash, cleanEmail], (updateErr) => {
                    if (updateErr) {
                        console.error("Password update error:", updateErr.message);
                        return res.status(500).json({
                            success: false,
                            message: "Could not reset password in database."
                        });
                    }

                    res.json({
                        success: true,
                        message: "Password reset successfully! You can now login with your new password."
                    });
                });
            }

            // When requested from forgot password forms (email verification)
            res.json({
                success: true,
                message: "Password reset instructions sent successfully to your registered email!"
            });
        });
    } catch (error) {
        console.error("Forgot password catch error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error occurred during password reset."
        });
    }
});

/* =====================================================
   USER PROFILE MANAGEMENT (MYSQL)
   ===================================================== */

// Get User Profile by Email
app.get("/api/users/profile/:email", (req, res) => {
    try {
        const email = req.params.email ? req.params.email.trim().toLowerCase() : "";

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid user email."
            });
        }

        const sql = `
            SELECT id, role, name, email, phone, city, address, status, created_at
            FROM users
            WHERE email = ?
        `;

        db.query(sql, [email], (err, rows) => {
            if (err) {
                console.error("Fetch user profile error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Database error while fetching profile."
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User profile not found."
                });
            }

            res.json({
                success: true,
                user: rows[0]
            });
        });
    } catch (error) {
        console.error("Profile route error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error occurred while fetching user profile."
        });
    }
});

// Update User Profile by Email
app.put("/api/users/profile/:email", (req, res) => {
    try {
        const email = req.params.email ? req.params.email.trim().toLowerCase() : "";
        const { name, phone, city, address } = req.body;

        const cleanName = typeof name === "string" ? name.trim() : "";
        const cleanPhone = typeof phone === "string" ? phone.trim() : "";
        const cleanCity = typeof city === "string" ? city.trim() : "";
        const cleanAddress = typeof address === "string" ? address.trim() : "";

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid user email."
            });
        }

        if (cleanName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must be at least 2 characters long."
            });
        }

        const updateSql = `
            UPDATE users
            SET name = ?, phone = ?, city = ?, address = ?
            WHERE email = ?
        `;

        db.query(updateSql, [cleanName, cleanPhone, cleanCity, cleanAddress, email], (err, result) => {
            if (err) {
                console.error("Update profile error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Database error while updating profile."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User account not found."
                });
            }

            res.json({
                success: true,
                message: "Profile updated successfully in MySQL!",
                user: {
                    name: cleanName,
                    email,
                    phone: cleanPhone,
                    city: cleanCity,
                    address: cleanAddress
                }
            });
        });
    } catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error occurred while updating profile."
        });
    }
});

/* =====================================================
   ORDERS & CHECKOUT MANAGEMENT (MYSQL)
   ===================================================== */

// Create New Order
app.post("/api/orders", (req, res) => {
    try {
        const {
            orderNumber,
            buyerEmail,
            customerName,
            phone,
            shippingAddress,
            city,
            state,
            pincode,
            totalAmount,
            paymentMethod,
            items
        } = req.body;

        const orderNum = orderNumber || ("SM" + Date.now());
        const cleanEmail = typeof buyerEmail === "string" ? buyerEmail.trim().toLowerCase() : "";
        const cleanName = typeof customerName === "string" ? customerName.trim() : "Customer";
        const cleanPhone = typeof phone === "string" ? phone.trim() : "";
        const cleanAddress = typeof shippingAddress === "string" ? shippingAddress.trim() : "";
        const cleanCity = typeof city === "string" ? city.trim() : "";
        const cleanState = typeof state === "string" ? state.trim() : "";
        const cleanPincode = typeof pincode === "string" ? pincode.trim() : "";
        const amount = Number(totalAmount) || 0;
        const payment = typeof paymentMethod === "string" ? paymentMethod.trim() : "Cash on Delivery";
        const orderItems = Array.isArray(items) ? items : [];

        if (!cleanEmail || !cleanPhone || !cleanAddress || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide complete delivery details and at least one order item."
            });
        }

        const insertOrderSql = `
            INSERT INTO orders
            (order_number, buyer_email, customer_name, phone, shipping_address, city, state, pincode, total_amount, payment_method, order_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Order Placed')
        `;

        db.query(
            insertOrderSql,
            [orderNum, cleanEmail, cleanName, cleanPhone, cleanAddress, cleanCity, cleanState, cleanPincode, amount, payment],
            (err, orderResult) => {
                if (err) {
                    console.error("Order insertion error:", err.message);
                    return res.status(500).json({
                        success: false,
                        message: "Failed to create order in database."
                    });
                }

                const orderId = orderResult.insertId;

                // Insert items into order_items table
                const itemValues = orderItems.map(item => [
                    orderId,
                    item.productId || item.id || null,
                    item.productName || item.name || "Product",
                    item.seller || item.sellerName || "SUGA MART Seller",
                    Number(item.price) || 0,
                    Number(item.quantity) || 1,
                    (Number(item.price) || 0) * (Number(item.quantity) || 1)
                ]);

                const insertItemsSql = `
                    INSERT INTO order_items
                    (order_id, product_id, product_name, seller_name, price, quantity, item_total)
                    VALUES ?
                `;

                db.query(insertItemsSql, [itemValues], (itemErr) => {
                    if (itemErr) {
                        console.error("Order items insertion error:", itemErr.message);
                    }

                    res.status(201).json({
                        success: true,
                        message: "Order placed successfully!",
                        orderNumber: orderNum,
                        orderId: orderId,
                        totalAmount: amount
                    });
                });
            }
        );
    } catch (error) {
        console.error("Create order catch error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error occurred while creating order."
        });
    }
});

// Get all orders (for Admin & Sellers)
app.get("/api/orders/all", (req, res) => {
    const sql = `
        SELECT o.id, o.order_number, o.buyer_email, o.customer_name,
               o.phone, o.total_amount, o.payment_method, o.order_status,
               o.created_at,
               COUNT(oi.id) AS total_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Fetch all orders error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Could not fetch orders."
            });
        }

        res.json({
            success: true,
            totalOrders: rows.length,
            orders: rows
        });
    });
});

// Get orders for a specific buyer
app.get("/api/orders/buyer/:email", (req, res) => {
    const email = req.params.email ? req.params.email.trim().toLowerCase() : "";

    const sql = `
        SELECT o.id, o.order_number, o.buyer_email, o.customer_name,
               o.shipping_address, o.city, o.state, o.pincode,
               o.total_amount, o.payment_method, o.order_status,
               o.created_at,
               COUNT(oi.id) AS total_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.buyer_email = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;

    db.query(sql, [email], (err, rows) => {
        if (err) {
            console.error("Fetch buyer orders error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Could not fetch buyer orders."
            });
        }

        res.json({
            success: true,
            orders: rows
        });
    });
});

// Get single order details with items
app.get("/api/orders/details/:orderNumber", (req, res) => {
    const orderNumber = req.params.orderNumber;

    const orderSql = "SELECT * FROM orders WHERE order_number = ?";
    db.query(orderSql, [orderNumber], (err, orderRows) => {
        if (err || orderRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const order = orderRows[0];
        const itemsSql = "SELECT * FROM order_items WHERE order_id = ?";

        db.query(itemsSql, [order.id], (itemErr, itemRows) => {
            res.json({
                success: true,
                order: {
                    ...order,
                    items: itemRows || []
                }
            });
        });
    });
});

// Update Order Status (Seller / Admin)
app.put("/api/orders/:orderNumber/status", (req, res) => {
    try {
        const orderNumber = req.params.orderNumber;
        const { status } = req.body;

        const validStatuses = ["Order Placed", "Order Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Allowed values: " + validStatuses.join(", ")
            });
        }

        const sql = "UPDATE orders SET order_status = ? WHERE order_number = ?";
        db.query(sql, [status, orderNumber], (err, result) => {
            if (err) {
                console.error("Update order status error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Database error while updating order status."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found."
                });
            }

            res.json({
                success: true,
                message: `Order status successfully updated to '${status}'.`,
                orderNumber,
                status
            });
        });
    } catch (error) {
        console.error("Update status catch error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error occurred while updating order status."
        });
    }
});

/* =====================================================
   PRODUCT CATALOG & INVENTORY MANAGEMENT (MYSQL)
   ===================================================== */

// Get all products (with optional category & search filter)
app.get("/api/products", (req, res) => {
    const { category, search, seller } = req.query;

    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category && category !== "All") {
        sql += " AND category = ?";
        params.push(category);
    }

    if (search && search.trim() !== "") {
        sql += " AND (name LIKE ? OR description LIKE ?)";
        const term = `%${search.trim()}%`;
        params.push(term, term);
    }

    if (seller && seller.trim() !== "") {
        sql += " AND seller_name = ?";
        params.push(seller.trim());
    }

    sql += " ORDER BY id ASC";

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error("Fetch products error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Could not fetch products from database."
            });
        }

        res.json({
            success: true,
            totalProducts: rows.length,
            products: rows
        });
    });
});

// Get single product by ID
app.get("/api/products/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID."
        });
    }

    db.query("SELECT * FROM products WHERE id = ?", [id], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            product: rows[0]
        });
    });
});

// Add New Product (Seller)
app.post("/api/products", (req, res) => {
    try {
        const {
            name,
            category,
            price,
            stock,
            description,
            sellerName,
            sellerEmail,
            imageUrl
        } = req.body;

        const cleanName = typeof name === "string" ? name.trim() : "";
        const cleanCategory = typeof category === "string" ? category.trim() : "";
        const numPrice = Number(price);
        const numStock = Number(stock);
        const cleanDesc = typeof description === "string" ? description.trim() : "";
        const cleanSeller = typeof sellerName === "string" ? sellerName.trim() : "Urban Wood Studio";
        const cleanEmail = typeof sellerEmail === "string" ? sellerEmail.trim().toLowerCase() : "seller@gmail.com";
        const img = typeof imageUrl === "string" && imageUrl.trim() !== ""
            ? imageUrl.trim()
            : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80";

        if (cleanName.length < 2 || cleanName.length > 150) {
            return res.status(400).json({
                success: false,
                message: "Product name must be between 2 and 150 characters."
            });
        }

        if (!cleanCategory) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid product category."
            });
        }

        if (Number.isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid positive number."
            });
        }

        if (Number.isNaN(numStock) || numStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity must be 0 or higher."
            });
        }

        if (cleanDesc.length < 5) {
            return res.status(400).json({
                success: false,
                message: "Product description must be at least 5 characters long."
            });
        }

        const insertSql = `
            INSERT INTO products 
            (name, category, price, seller_name, seller_email, stock, description, image_url, rating, reviews_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 4.5, 0)
        `;

        db.query(
            insertSql,
            [cleanName, cleanCategory, numPrice, cleanSeller, cleanEmail, numStock, cleanDesc, img],
            (err, result) => {
                if (err) {
                    console.error("Add product error:", err.message);
                    return res.status(500).json({
                        success: false,
                        message: "Failed to add product into database."
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "Product added successfully to MySQL!",
                    productId: result.insertId,
                    product: {
                        id: result.insertId,
                        name: cleanName,
                        category: cleanCategory,
                        price: numPrice,
                        stock: numStock,
                        seller_name: cleanSeller
                    }
                });
            }
        );
    } catch (error) {
        console.error("Add product catch error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error occurred while adding product."
        });
    }
});

// Update Existing Product (Seller)
app.put("/api/products/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, category, price, stock, description } = req.body;

        const cleanName = typeof name === "string" ? name.trim() : "";
        const cleanCategory = typeof category === "string" ? category.trim() : "";
        const numPrice = Number(price);
        const numStock = Number(stock);
        const cleanDesc = typeof description === "string" ? description.trim() : "";

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ success: false, message: "Invalid product ID." });
        }

        if (!cleanName || !cleanCategory || numPrice <= 0 || numStock < 0 || !cleanDesc) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all product fields correctly."
            });
        }

        const updateSql = `
            UPDATE products 
            SET name = ?, category = ?, price = ?, stock = ?, description = ?
            WHERE id = ?
        `;

        db.query(updateSql, [cleanName, cleanCategory, numPrice, numStock, cleanDesc, id], (err, result) => {
            if (err) {
                console.error("Update product error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Failed to update product in database."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "Product not found." });
            }

            res.json({
                success: true,
                message: "Product updated successfully in MySQL!",
                productId: id
            });
        });
    } catch (error) {
        console.error("Update product catch error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error occurred while updating product."
        });
    }
});

// Delete Product (Seller / Admin)
app.delete("/api/products/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Delete product error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Failed to delete product from database."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        res.json({
            success: true,
            message: "Product deleted successfully from MySQL!",
            productId: id
        });
    });
});

/* =====================================================
   ADMIN MANAGEMENT & ANALYTICS REPORTS (MYSQL)
   ===================================================== */

// Get all users / sellers for Admin
app.get("/api/admin/users", (req, res) => {
    const { role } = req.query;
    let sql = "SELECT id, role, name, email, phone, city, address, status, created_at FROM users";
    const params = [];

    if (role) {
        sql += " WHERE role = ?";
        params.push(role);
    }

    sql += " ORDER BY id DESC";

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error("Fetch admin users error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Could not fetch users from database."
            });
        }

        res.json({
            success: true,
            totalUsers: rows.length,
            users: rows
        });
    });
});

// Update user / seller status (Admin)
app.put("/api/admin/users/:id/status", (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
    }

    const cleanStatus = typeof status === "string" ? status.trim() : "Active";

    db.query("UPDATE users SET status = ? WHERE id = ?", [cleanStatus, id], (err, result) => {
        if (err) {
            console.error("Update user status error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Database error while updating user status."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.json({
            success: true,
            message: `User status successfully updated to '${cleanStatus}' in MySQL!`,
            userId: id,
            status: cleanStatus
        });
    });
});

// Get marketplace analytics & reports (Admin)
app.get("/api/admin/reports", (req, res) => {
    const reportsSql = `
        SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'buyer') AS total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'seller') AS total_sellers,
            (SELECT COUNT(*) FROM products) AS total_products,
            (SELECT COUNT(*) FROM orders) AS total_orders,
            (SELECT COUNT(*) FROM orders WHERE order_status = 'Delivered') AS completed_orders,
            (SELECT COUNT(*) FROM orders WHERE order_status NOT IN ('Delivered', 'Cancelled')) AS pending_orders,
            (SELECT IFNULL(SUM(total_amount), 0) FROM orders) AS total_sales,
            (SELECT IFNULL(SUM(total_amount), 0) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS monthly_sales,
            (SELECT IFNULL(ROUND(AVG(total_amount), 2), 0) FROM orders) AS avg_order_value
    `;

    db.query(reportsSql, (err, rows) => {
        if (err) {
            console.error("Fetch reports error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Could not fetch marketplace reports."
            });
        }

        const stats = rows[0] || {};
        res.json({
            success: true,
            reports: {
                totalUsers: Number(stats.total_users || 0),
                totalSellers: Number(stats.total_sellers || 0),
                totalProducts: Number(stats.total_products || 0),
                totalOrders: Number(stats.total_orders || 0),
                completedOrders: Number(stats.completed_orders || 0),
                pendingOrders: Number(stats.pending_orders || 0),
                totalSales: Number(stats.total_sales || 0),
                monthlySales: Number(stats.monthly_sales || 0),
                avgOrderValue: Number(stats.avg_order_value || 0)
            }
        });
    });
});

app.listen(PORT, "0.0.0.0", () => {
    const networkInterfaces = os.networkInterfaces();
    let localIP = "localhost";
    for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            if (net.family === "IPv4" && !net.internal) {
                localIP = net.address;
                break;
            }
        }
    }
    console.log("=======================================================");
    console.log(" 🛍️  SUGA'S MART MARKETPLACE IS LIVE & RUNNING!");
    console.log(` 💻 PC Browser:     http://localhost:${PORT}`);
    console.log(` 📱 Mobile Browser: http://${localIP}:${PORT}`);
    console.log("=======================================================");
});