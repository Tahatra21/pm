import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from 'dotenv';

// Load .env if not already loaded (useful for standalone scripts)
dotenv.config();

if (!process.env.DATABASE_URL) {
    console.warn("WARNING: DATABASE_URL is not defined in environment variables.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

if (process.env.DATABASE_URL) {
    const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@");
    console.log(`[DB] Connecting to: ${maskedUrl}`);
}

const adapter = new PrismaPg(pool);
export const db = new PrismaClient({ adapter });
export const prisma = db;
