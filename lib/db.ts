import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: "sql12.freesqldatabase.com",
  user: "sql12791346",
  password: "eYH7qsZqU3",
  database: "sql12791346",
  waitForConnections: true,
  connectionLimit: 20,
  // queueLimit: 0,
})

export default pool
