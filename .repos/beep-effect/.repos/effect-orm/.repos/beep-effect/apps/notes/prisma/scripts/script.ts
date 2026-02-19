import { prisma } from "../../src/server/db";

const script = async () => {
  try {
    console.info("Testing script...");
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

void script();
