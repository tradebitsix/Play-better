import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
export async function migrate(pool){
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const sql = fs.readFileSync(path.join(__dirname,'schema.sql'),'utf8')
  await pool.query(sql)
}
