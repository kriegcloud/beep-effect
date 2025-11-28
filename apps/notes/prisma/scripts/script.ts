import { prisma } from "../../src/server/db";

const script = async () => {
  try {
    console.info("Testing script...");
  } catch (error) {
    console.error(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

void script();
