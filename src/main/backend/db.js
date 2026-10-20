const mysql = require("mysql2");

let config;

if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    config = {
        host: url.hostname,
        port: Number(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace(/^\//, ""),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
    if (url.searchParams.get("ssl") || process.env.DB_SSL === "true") {
        config.ssl = { rejectUnauthorized: false };
    }
} else {
    config = {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "12122007",
        database: process.env.DB_NAME || "suga_mart",
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
    if (process.env.DB_SSL === "true" || process.env.DB_SSL === "1") {
        config.ssl = { rejectUnauthorized: false };
    }
}

// Connection pool handles reconnects and cloud timeouts automatically
const pool = mysql.createPool(config);

pool.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }
    console.log("SUGA'S MART database connected successfully!");
    connection.release();
});

module.exports = pool;