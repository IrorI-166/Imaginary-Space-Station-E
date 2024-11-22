import { defineConfig } from 'drizzle-kit';
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    out: './src/lib/config/db/drizzle',
    schema: './src/lib/config/db/schema/*',
    dialect: 'postgresql',
    dbCredentials: {
        host: process.env.DATABASE_HOST || "localhost",
        port: parseInt(process.env.DATABASE_PORT || "5432", 10),
        user: process.env.DATABASE_USER || "your_user",
        password: process.env.DATABASE_PASSWORD || "your_password",
        database: process.env.DATABASE_NAME || "your_database",
    },
});