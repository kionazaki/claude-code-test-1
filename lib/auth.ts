import { betterAuth } from "better-auth";
import { Database } from "bun:sqlite";

const DB_PATH = process.env.DATABASE_URL ?? "./sqlite.db";

export const auth = betterAuth({
  database: new Database(DB_PATH),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});
