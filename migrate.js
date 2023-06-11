import { drizzle, } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
 
// for migrations
console.log(process.env.DATABASE_URL)
const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' })
} catch (e) {
  throw new Error(e)
}

process.exit()