import { env } from "@beep/notes/env";
import { PrismaClient } from "@beep/notes/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { pgPool } from "./pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pgPool),
    log:
      env.NODE_ENV === "development"
        ? [
            // 'query', 'info',
            "error",
            "warn",
          ]
        : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { pgPool as pool } from "./pg";
