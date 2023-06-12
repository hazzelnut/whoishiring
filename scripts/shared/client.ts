import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const queryClient = postgres(process.env.DATABASE_URL!);
const db: PostgresJsDatabase = drizzle(queryClient);

export default db
