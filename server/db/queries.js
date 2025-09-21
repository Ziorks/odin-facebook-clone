require("dotenv").config();
const { PrismaClient, Prisma } = require("../generated/prisma");

const databaseUrl =
  process.env.NODE_ENV.trim() === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function resetDatabase() {
  const tableNames = Object.values(Prisma.ModelName);
  for (const tableName of tableNames) {
    await prisma.$queryRawUnsafe(
      `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`
    );
  }
}

module.exports = { resetDatabase };
