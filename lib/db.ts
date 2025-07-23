import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12791346',
  password: 'eYH7qsZqU3',
  database: 'sql12791346',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export async function query(sql: string, params: unknown[] = []) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export default pool
