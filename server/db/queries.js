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

//READ QUERIES

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user;
}

async function getUserByUsername(username) {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
  });

  return user;
}

async function getValidRefreshTokensByUserId(userId) {
  const refreshToken = await prisma.refreshToken.findMany({
    where: {
      userId,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
  });

  return refreshToken;
}

//CREATE QUERIES

async function createUser(username, hashedPassword) {
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  return user;
}

async function createRefreshToken(hashedToken, userId, expiresAt) {
  const refreshToken = await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      user: { connect: { id: userId } },
      expiresAt,
    },
  });

  return refreshToken;
}

//UPDATE QUERIES

async function updateRefreshToken(tokenId, { revoked }) {
  const token = await prisma.refreshToken.update({
    where: {
      id: tokenId,
    },
    data: {
      revoked,
    },
  });

  return token;
}

async function resetDatabase() {
  const tableNames = Object.values(Prisma.ModelName);
  for (const tableName of tableNames) {
    await prisma.$queryRawUnsafe(
      `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`
    );
  }
}

module.exports = {
  getUserById,
  getUserByUsername,
  getValidRefreshTokensByUserId,
  createUser,
  createRefreshToken,
  updateRefreshToken,
  resetDatabase,
};
