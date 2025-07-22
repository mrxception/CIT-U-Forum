import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "sql12.freesqldatabase.com",
  user: process.env.DB_USER || "sql12791346",
  password: process.env.DB_PASSWORD || "eYH7qsZqU3",
  database: process.env.DB_NAME || "sql12791346",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default pool
