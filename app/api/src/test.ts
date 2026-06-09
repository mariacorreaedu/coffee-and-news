import { db } from "./database/knex";

async function main() {
   const result = await db.raw("SELECT NOW()")
   console.log(result.rows)
}

main()