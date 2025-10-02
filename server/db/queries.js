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

async function getUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
}

async function getUserByOauthToken(tokenId) {
  const oauthToken = await prisma.oauthToken.findUnique({
    where: { id: tokenId },
    include: { user: true },
  });

  if (oauthToken) {
    return oauthToken.user;
  }
  return oauthToken;
}

async function getUserWithProfile(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      profile: true,
    },
  });

  return user;
}

async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      profile: { select: { avatar: true } },
    },
  });

  return users;
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

async function getFederatedCredentials(providerId, provider) {
  const credentials = await prisma.federatedCredential.findUnique({
    where: {
      provider_providerId: { provider, providerId },
    },
    include: { user: true },
  });

  return credentials;
}

async function getFriendshipById(id) {
  const friendship = await prisma.friendship.findUnique({
    where: { id },
  });

  return friendship;
}

async function getFriendshipByUserIds(userId1, userId2) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { user1Id: userId1, user2Id: userId2 },
        { user1Id: userId2, user2Id: userId1 },
      ],
    },
  });

  return friendship;
}

async function getUsersFriends(userId, { pending = false } = {}) {
  const userOptions = {
    select: {
      username: true,
      id: true,
      profile: { select: { avatar: true } },
    },
  };

  const friends = await prisma.friendship.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
      accepted: !pending,
    },
    include: {
      user1: userOptions,
      user2: userOptions,
    },
  });

  return friends;
}

//CREATE QUERIES

async function createUser(username, hashedPassword, email) {
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      email,
    },
  });

  return user;
}

async function createProfile(userId, { avatar, firstName, lastName } = {}) {
  const profile = await prisma.profile.create({
    data: {
      user: { connect: { id: userId } },
      avatar,
      firstName,
      lastName,
    },
  });

  return profile;
}

async function createRefreshToken(
  hashedToken,
  userId,
  rememberDevice,
  expiresAt
) {
  const refreshToken = await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      user: { connect: { id: userId } },
      rememberDevice,
      expiresAt,
    },
  });

  return refreshToken;
}

async function createFederatedCredentials(providerId, provider, userId) {
  const credentials = await prisma.federatedCredential.create({
    data: {
      providerId,
      provider,
      user: { connect: { id: userId } },
    },
  });

  return credentials;
}

async function createOauthToken(userId) {
  const oauthToken = await prisma.oauthToken.create({
    data: {
      user: { connect: { id: userId } },
    },
  });

  return oauthToken;
}

async function createFriendship(senderId, recipientId) {
  const friendship = await prisma.friendship.create({
    data: {
      user1: { connect: { id: senderId } },
      user2: { connect: { id: recipientId } },
    },
  });

  return friendship;
}

//UPDATE QUERIES

async function updateProfile(profileId, { avatar, firstName, lastName } = {}) {
  const profile = await prisma.profile.update({
    where: {
      id: profileId,
    },
    data: {
      avatar,
      firstName,
      lastName,
    },
  });

  return profile;
}

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

async function updateFriendship(friendshipId, { accepted }) {
  const friendship = await prisma.friendship.update({
    where: {
      id: friendshipId,
    },
    data: {
      accepted,
      updatedAt: new Date(),
    },
  });

  return friendship;
}

//DELETE QUERIES

async function deleteOauthToken(tokenId) {
  const oauthToken = await prisma.oauthToken.delete({
    where: { id: tokenId },
  });

  return oauthToken;
}

async function deleteFriendship(id) {
  const deletedFriendship = await prisma.friendship.delete({
    where: {
      id,
    },
  });

  return deletedFriendship;
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
  getUserByEmail,
  getUserByOauthToken,
  getUserWithProfile,
  getAllUsers,
  getValidRefreshTokensByUserId,
  getFederatedCredentials,
  getFriendshipById,
  getFriendshipByUserIds,
  getUsersFriends,
  createUser,
  createProfile,
  createRefreshToken,
  createFederatedCredentials,
  createOauthToken,
  createFriendship,
  updateProfile,
  updateRefreshToken,
  updateFriendship,
  deleteOauthToken,
  deleteFriendship,
  resetDatabase,
};
