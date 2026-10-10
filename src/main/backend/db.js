
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12122007",
    database: "suga_mart",
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("SUGA'S MART database connected successfully!");
});

module.exports = db;