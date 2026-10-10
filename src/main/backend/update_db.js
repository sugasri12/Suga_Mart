const db = require("./db");

db.query("SHOW COLUMNS FROM product_reviews LIKE 'status'", (err, rows) => {
    if (err) {
        console.error("Error checking column:", err.message);
        db.end();
        return;
    }

    if (rows.length === 0) {
        db.query("ALTER TABLE product_reviews ADD COLUMN status VARCHAR(20) DEFAULT 'Published'", (alterErr) => {
            if (alterErr) {
                console.error("Error adding status column:", alterErr.message);
            } else {
                console.log("Successfully added 'status' column to product_reviews!");
            }
            db.end();
        });
    } else {
        console.log("'status' column already exists in product_reviews.");
        db.end();
    }
});
