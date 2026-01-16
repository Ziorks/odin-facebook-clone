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

//UTIL FUNCTIONS
async function attachLikesToPosts(posts) {
  // Extract post and comment/reply ids
  const postIds = [];
  const commentIds = [];

  for (const post of posts) {
    postIds.push(post.id);
    if (post.comments.length > 0) {
      commentIds.push(post.comments[0].id);
      if (post.comments[0].replies.length === 1) {
        commentIds.push(post.comments[0].replies[0].id);
      }
    }
  }

  // Fetch likes for posts and any comments/replies
  const likes = await prisma.like.findMany({
    where: {
      OR: [
        { targetType: "POST", targetId: { in: postIds } },
        { targetType: "COMMENT", targetId: { in: commentIds } },
      ],
    },
    include: {
      user: { select: { id: true, username: true } },
    },
  });

  // Stitch results together

  // reduce likes to object where key is 'targetType:targetId' and value is array of users
  const likesByTarget = likes.reduce((acc, like) => {
    const key = `${like.targetType}:${like.targetId}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    if (acc[key]) {
      acc[key].push(like.user);
    }
    return acc;
  }, {});

  //  map through posts and get postLikes, comment, commentLikes, reply, and replyLikes
  const result = posts.map((post) => {
    const postLikes = likesByTarget[`POST:${post.id}`] ?? [];

    const comment = post.comments[0];
    const commentLikes = comment
      ? likesByTarget[`COMMENT:${comment.id}`] ?? []
      : [];

    const replyCount = comment?._count.replies ?? 0;
    const reply = comment?.replies[0];
    const replyLikes = reply ? likesByTarget[`COMMENT:${reply.id}`] ?? [] : [];

    //  assemble post object with added properties
    delete post.comments;
    if (comment) {
      delete comment.replies;
    }

    return {
      ...post,
      _count: {
        ...post._count,
        likes: postLikes.length,
      },
      likedBy: postLikes,
      comment: comment
        ? {
            ...comment,
            _count: {
              ...comment._count,
              likes: commentLikes.length,
            },
            likedBy: commentLikes,
            reply:
              replyCount === 1
                ? {
                    ...reply,
                    _count: {
                      ...reply._count,
                      likes: replyLikes.length,
                    },
                    likedBy: replyLikes,
                  }
                : null,
          }
        : null,
    };
  });

  return result;
}

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
      profile: {
        include: {
          workAndEducation: true,
          placesLived: true,
          contactInfo: true,
          details: true,
        },
      },
    },
  });

  return user;
}

async function getUserSanitized(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      password: true,
      email: true,
      profile: {
        select: {
          avatar: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!user) {
    return user;
  }

  user.password = !!user.password;

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

async function getUsersFriends(userId, { pending, page, resultsPerPage } = {}) {
  const userOptions = {
    select: {
      username: true,
      id: true,
      profile: { select: { avatar: true } },
    },
  };
  const where = {
    OR: [{ user1Id: userId }, { user2Id: userId }],
    accepted: pending === undefined ? undefined : !pending,
  };

  if (page || resultsPerPage) {
    page = page || 1;
    resultsPerPage = resultsPerPage || 10;

    const count = await prisma.friendship.count({ where });

    const friends = await prisma.friendship.findMany({
      skip: (page - 1) * resultsPerPage,
      take: resultsPerPage,
      where,
      include: {
        user1: userOptions,
        user2: userOptions,
      },
      omit: {
        user1Id: true,
        user2Id: true,
      },
    });

    return { friends, count };
  } else {
    const friends = await prisma.friendship.findMany({
      where,
      include: {
        user1: userOptions,
        user2: userOptions,
      },
      omit: {
        user1Id: true,
        user2Id: true,
      },
    });

    return { friends, count: friends.length };
  }
}

async function getUsersIncomingFriendRequests(userId) {
  const userOptions = {
    select: {
      username: true,
      id: true,
      profile: { select: { avatar: true } },
    },
  };

  const requests = await prisma.friendship.findMany({
    where: {
      user2Id: userId,
      accepted: false,
    },
    include: {
      user1: userOptions,
      user2: userOptions,
    },
    omit: {
      user1Id: true,
      user2Id: true,
    },
  });

  return requests;
}

async function getUsersOutgoingFriendRequests(userId) {
  const userOptions = {
    select: {
      username: true,
      id: true,
      profile: { select: { avatar: true } },
    },
  };

  const requests = await prisma.friendship.findMany({
    where: {
      user1Id: userId,
      accepted: false,
    },
    include: {
      user1: userOptions,
      user2: userOptions,
    },
    omit: {
      user1Id: true,
      user2Id: true,
    },
  });

  return requests;
}

async function getPost(postId) {
  //TODO: get first 5-10 comments, then let app request more
  const [post, likeCount, likedBy] = await prisma.$transaction([
    prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: { select: { avatar: true } },
          },
        },
        wall: {
          select: {
            id: true,
            username: true,
            profile: { select: { avatar: true } },
          },
        },
        comments: {
          where: { parentId: null },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                profile: { select: { avatar: true } },
              },
            },
            _count: { select: { replies: { where: { isDeleted: false } } } },
          },
          omit: { authorId: true },
        },
        _count: {
          select: { comments: { where: { isDeleted: false, parentId: null } } },
        },
      },
      omit: { authorId: true, wallId: true },
    }),
    prisma.like.count({ where: { targetType: "POST", targetId: postId } }),
    prisma.like.findMany({
      where: { targetType: "POST", targetId: postId },
      select: { user: { select: { id: true, username: true } } },
    }),
  ]);

  if (!post) {
    return null;
  }

  const commentIds = post.comments.map((comment) => comment.id);

  const likes = await prisma.like.findMany({
    where: { targetType: "COMMENT", targetId: { in: commentIds } },
    include: { user: { select: { id: true, username: true } } },
  });

  const likesByComment = likes.reduce((acc, like) => {
    const key = like.targetId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(like.user);
    return acc;
  }, {});

  const commentsWithLikes = post.comments.map((comment) => {
    const likes = likesByComment[comment.id] ?? [];

    return {
      ...comment,
      _count: { ...comment._count, likes: likes.length },
      likedBy: likes,
    };
  });

  const result = {
    ...post,
    comments: commentsWithLikes,
    _count: { ...post._count, likes: likeCount },
    likedBy: likedBy.map((user) => user.user),
  };

  return result;
}

async function getPostComments(postId) {
  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profile: { select: { avatar: true } },
        },
      },
      _count: { select: { replies: { where: { isDeleted: false } } } },
    },
    omit: { authorId: true },
    orderBy: { createdAt: "desc" },
  });

  const commentIds = comments.map((comment) => comment.id);

  const likes = await prisma.like.findMany({
    where: { targetType: "COMMENT", targetId: { in: commentIds } },
    include: { user: { select: { id: true, username: true } } },
  });

  const likesByComment = likes.reduce((acc, like) => {
    const key = like.targetId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(like.user);
    return acc;
  }, {});

  const result = comments.map((comment) => {
    const likes = likesByComment[comment.id] ?? [];

    return {
      ...comment,
      _count: { ...comment._count, likes: likes.length },
      likedBy: likes,
    };
  });

  return result;
}

async function getComment(commentId) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profile: { select: { avatar: true } },
        },
      },
      _count: { select: { replies: { where: { isDeleted: false } } } },
    },
    omit: { authorId: true },
  });

  return comment;
}

async function getCommentReplies(commentId) {
  const replies = await prisma.comment.findMany({
    where: {
      parentId: commentId,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profile: { select: { avatar: true } },
        },
      },
      _count: { select: { replies: { where: { isDeleted: false } } } },
    },
    omit: { authorId: true },
  });

  const replyIds = replies.map((reply) => reply.id);

  const likes = await prisma.like.findMany({
    where: { targetType: "COMMENT", targetId: { in: replyIds } },
    include: { user: { select: { id: true, username: true } } },
  });

  const likesByReply = likes.reduce((acc, like) => {
    const key = like.targetId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(like.user);
    return acc;
  }, {});

  const result = replies.map((reply) => {
    const likes = likesByReply[reply.id] ?? [];

    return {
      ...reply,
      _count: { ...reply._count, likes: likes.length },
      likedBy: likes,
    };
  });

  return result;
}

async function getLike(userId, targetId, targetType) {
  const like = await prisma.like.findUnique({
    where: {
      userId_targetId_targetType: {
        userId,
        targetId,
        targetType,
      },
    },
  });

  return like;
}

async function getWall(wallId, { page, resultsPerPage } = {}) {
  const where = {
    wallId,
    //TODO: select by privacy here when/if I add that
  };
  const userOptions = {
    select: {
      id: true,
      username: true,
      profile: { select: { avatar: true } },
    },
  };
  const queryOptions = {
    where,
    include: {
      author: userOptions,
      wall: userOptions,
      comments: {
        where: {
          parentId: null,
          isDeleted: false,
        },
        take: 1,
        orderBy: { createdAt: "desc" },
        omit: { authorId: true },
        include: {
          author: userOptions,
          replies: {
            where: { isDeleted: false },
            take: 1,
            include: {
              author: userOptions,
              _count: {
                select: {
                  replies: {
                    where: { isDeleted: false },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              replies: {
                where: { isDeleted: false },
              },
            },
          },
        },
      },
      _count: {
        select: { comments: { where: { isDeleted: false, parentId: null } } },
      },
    },
    omit: {
      authorId: true,
      wallId: true,
    },
    orderBy: { createdAt: "desc" },
  };

  let count = undefined;
  if (page || resultsPerPage) {
    page = page || 1;
    resultsPerPage = resultsPerPage || 10;
    queryOptions.skip = (page - 1) * resultsPerPage;
    queryOptions.take = resultsPerPage;
    count = await prisma.post.count({ where });
  }

  const posts = await prisma.post.findMany(queryOptions);

  const wall = await attachLikesToPosts(posts);

  return { wall, count: count === undefined ? wall.length : count };
}

async function getAboutOverviewByUserId(userId) {
  const profile = await prisma.profile.findFirst({
    where: { userId },
    select: {
      workAndEducation: {
        select: {
          works: {
            take: 1,
            orderBy: [
              { endYear: "desc" },
              { startYear: "desc" },
              { currentJob: "desc" },
            ],
          },
          schools: {
            take: 1,
            orderBy: [{ endYear: "desc" }, { startYear: "desc" }],
          },
        },
      },
      placesLived: {
        select: {
          currentCity: true,
          hometown: true,
        },
      },
    },
  });

  if (!profile) {
    return profile;
  }

  const { works, schools } = profile.workAndEducation;
  const { currentCity, hometown } = profile.placesLived;

  return { work: works[0], school: schools[0], currentCity, hometown };
}

async function getWorkAndEducationByUserId(userId) {
  const workAndEducation = await prisma.workAndEducation.findFirst({
    where: { profile: { userId } },
    include: {
      works: {
        orderBy: [
          { endYear: "desc" },
          { startYear: "desc" },
          { currentJob: "desc" },
        ],
      },
      schools: { orderBy: [{ endYear: "desc" }, { startYear: "desc" }] },
    },
  });

  return workAndEducation;
}

async function getWork(workId) {
  const work = await prisma.work.findUnique({ where: { id: workId } });

  return work;
}

async function getUsersWorksCount(userId) {
  const count = await prisma.work.count({
    where: { workAndEducation: { profile: { userId } } },
  });

  return count;
}

async function getSchool(schoolId) {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });

  return school;
}

async function getUsersSchoolsCount(userId) {
  const count = await prisma.school.count({
    where: { workAndEducation: { profile: { userId } } },
  });

  return count;
}

async function getPlacesLivedByUserId(userId) {
  const placesLived = await prisma.placesLived.findFirst({
    where: { profile: { userId } },
    include: {
      cities: { orderBy: { yearMoved: "desc" } },
      hometown: true,
      currentCity: true,
    },
  });

  return placesLived;
}

async function getUsersHometown(userId) {
  const hometown = await prisma.city.findFirst({
    where: { hometown: { profile: { userId } } },
  });

  return hometown;
}

async function getUsersCurrentCity(userId) {
  const currentCity = await prisma.city.findFirst({
    where: { currentCity: { profile: { userId } } },
  });

  return currentCity;
}

async function getUsersCityCount(userId) {
  const count = await prisma.city.count({
    where: { placesLived: { profile: { userId } } },
  });

  return count;
}

async function getCity(cityId) {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
  });

  return city;
}

async function getContactInfoByUserId(userId) {
  const contactInfo = await prisma.contactInfo.findFirst({
    where: { profile: { userId } },
    include: {
      birthday: { select: { month: true, day: true, year: true } },
    },
  });

  return contactInfo;
}

async function getDetailsByUserId(userId) {
  const details = await prisma.details.findFirst({
    where: { profile: { userId } },
  });

  return details;
}

async function getUsersFeed(userId, { page, resultsPerPage } = {}) {
  const where = {
    //TODO: select by privacy here when/if I add that
  };
  const userOptions = {
    select: {
      id: true,
      username: true,
      profile: { select: { avatar: true } },
    },
  };
  const queryOptions = {
    where,
    include: {
      author: userOptions,
      wall: userOptions,
      comments: {
        where: {
          parentId: null,
          isDeleted: false,
        },
        take: 1,
        orderBy: { createdAt: "desc" },
        omit: { authorId: true },
        include: {
          author: userOptions,
          replies: {
            where: { isDeleted: false },
            take: 1,
            include: {
              author: userOptions,
              _count: {
                select: {
                  replies: {
                    where: { isDeleted: false },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              replies: {
                where: { isDeleted: false },
              },
            },
          },
        },
      },
      _count: {
        select: { comments: { where: { isDeleted: false, parentId: null } } },
      },
    },
    omit: {
      authorId: true,
      wallId: true,
    },
    orderBy: { createdAt: "desc" },
  };

  let count = undefined;
  if (page || resultsPerPage) {
    page = page || 1;
    resultsPerPage = resultsPerPage || 10;
    queryOptions.skip = (page - 1) * resultsPerPage;
    queryOptions.take = resultsPerPage;
    count = await prisma.post.count({ where });
  }

  const posts = await prisma.post.findMany(queryOptions);

  const feed = await attachLikesToPosts(posts);

  return { feed, count: count === undefined ? feed.length : count };
}

//CREATE QUERIES

async function createUser(
  username,
  hashedPassword,
  email,
  { avatar, firstName, lastName } = {}
) {
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      email,
      profile: {
        create: {
          avatar,
          firstName,
          lastName,
          workAndEducation: { create: {} },
          placesLived: { create: {} },
          contactInfo: { create: { birthday: { create: {} } } },
          details: { create: {} },
        },
      },
    },
  });

  return user;
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

async function createRegularPost(authorId, wallId, content) {
  const userOptions = {
    select: {
      id: true,
      username: true,
      profile: { select: { avatar: true } },
    },
  };
  const post = await prisma.post.create({
    data: {
      author: { connect: { id: authorId } },
      wall: { connect: { id: wallId } },
      content,
      type: "REGULAR",
    },
    include: {
      author: userOptions,
      wall: userOptions,
    },
    omit: {
      authorId: true,
      wallId: true,
    },
  });

  return { ...post, _count: { comments: 0, likes: 0 }, likedBy: [] };
}

async function createProfilePicUpdatePost(wallId, mediaUrl) {
  const userOptions = {
    select: {
      id: true,
      username: true,
      profile: { select: { avatar: true } },
    },
  };
  const post = await prisma.post.create({
    data: {
      author: { connect: { id: wallId } },
      wall: { connect: { id: wallId } },
      mediaUrl,
      type: "PROFILE_PIC_UPDATE",
    },
    include: {
      author: userOptions,
      wall: userOptions,
    },
    omit: {
      authorId: true,
      wallId: true,
    },
  });

  return { ...post, _count: { comments: 0, likes: 0 }, likedBy: [] };
}

async function createComment(authorId, postId, content, parentId) {
  const parent = parentId !== null ? { connect: { id: parentId } } : {};

  const comment = await prisma.comment.create({
    data: {
      author: { connect: { id: authorId } },
      post: { connect: { id: postId } },
      content,
      parent,
    },
    include: {
      author: {
        select: {
          username: true,
          id: true,
          profile: { select: { avatar: true } },
        },
      },
    },
    omit: { authorId: true },
  });

  comment._count = { likes: 0, replies: 0 };
  comment.likedByMe = false;
  comment.likedBySample = [];

  return comment;
}

async function createLike(userId, targetId, targetType) {
  const like = await prisma.like.create({
    data: {
      user: { connect: { id: userId } },
      targetId,
      targetType,
    },
  });

  return like;
}

async function createWork(
  workAndEducationId,
  { company, position, location, description, currentJob, startYear, endYear }
) {
  const work = await prisma.work.create({
    data: {
      workAndEducation: { connect: { id: workAndEducationId } },
      company,
      position,
      location,
      description,
      currentJob,
      startYear,
      endYear,
    },
  });

  return work;
}

async function createSchool(
  workAndEducationId,
  { name, description, degree, startYear, endYear, graduated }
) {
  const school = await prisma.school.create({
    data: {
      workAndEducation: { connect: { id: workAndEducationId } },
      name,
      description,
      degree,
      startYear,
      endYear,
      graduated,
    },
  });

  return school;
}

async function createCity(placesLivedId, { name, yearMoved }) {
  const city = await prisma.city.create({
    data: {
      placesLived: { connect: { id: placesLivedId } },
      name,
      yearMoved,
    },
  });

  return city;
}

async function createHometown(placesLivedId, { name }) {
  const hometown = await prisma.city.create({
    data: {
      hometown: { connect: { id: placesLivedId } },
      name,
    },
  });

  return hometown;
}

async function createCurrentCity(placesLivedId, { name }) {
  const currentCity = await prisma.city.create({
    data: {
      currentCity: { connect: { id: placesLivedId } },
      name,
    },
  });

  return currentCity;
}

//UPDATE QUERIES

async function updateUser(
  userId,
  { username, hashedPassword, email, avatar, firstName, lastName }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      username,
      password: hashedPassword,
      email,
      profile: {
        update: {
          avatar,
          firstName,
          lastName,
        },
      },
    },
  });

  return user;
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

async function updatePost(postId, { content }) {
  const post = await prisma.post.update({
    where: { id: postId },
    data: { content },
  });

  return post;
}

async function updateComment(commentId, { content }) {
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });

  return comment;
}

async function updateWork(
  workId,
  { company, position, location, description, currentJob, startYear, endYear }
) {
  const work = await prisma.work.update({
    where: { id: workId },
    data: {
      company,
      position,
      location,
      description,
      currentJob,
      startYear,
      endYear,
    },
  });

  return work;
}

async function updateSchool(
  schoolId,
  { name, description, degree, startYear, endYear, graduated }
) {
  const school = await prisma.school.update({
    where: { id: schoolId },
    data: {
      name,
      description,
      degree,
      startYear,
      endYear,
      graduated,
    },
  });

  return school;
}

async function updateCity(cityId, { name, yearMoved }) {
  const city = await prisma.city.update({
    where: { id: cityId },
    data: {
      name,
      yearMoved,
    },
  });

  return city;
}

async function updateContactInfo(
  contactInfoId,
  { phoneNumbers, emails, websites, socialLinks, gender, birthday, languages }
) {
  const { day, month, year } = birthday ?? {};

  const contactInfo = await prisma.contactInfo.update({
    where: { id: contactInfoId },
    data: {
      phoneNumbers,
      emails,
      websites,
      socialLinks,
      gender,
      birthday: { update: { data: { day, month, year } } },
      languages,
    },
  });

  return contactInfo;
}

async function updateDetails(
  detailsId,
  { aboutMe, quotes, music, books, tv, movies, sports, hobbies }
) {
  const details = await prisma.details.update({
    where: { id: detailsId },
    data: {
      aboutMe,
      quotes,
      music,
      books,
      tv,
      movies,
      sports,
      hobbies,
    },
  });

  return details;
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

async function deletePost(postId) {
  const post = await prisma.post.delete({
    where: { id: postId },
  });

  return post;
}

async function deleteLike(likeId) {
  const like = await prisma.like.delete({
    where: { id: likeId },
  });

  return like;
}

async function softDeleteComment(commentId) {
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { isDeleted: true },
  });

  return comment;
}

async function deleteWork(workId) {
  const work = await prisma.work.delete({
    where: { id: workId },
  });

  return work;
}

async function deleteSchool(schoolId) {
  const school = await prisma.school.delete({
    where: { id: schoolId },
  });

  return school;
}

async function deleteCity(cityId) {
  const city = await prisma.city.delete({
    where: { id: cityId },
  });

  return city;
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
  getUserSanitized,
  getAllUsers,
  getValidRefreshTokensByUserId,
  getFederatedCredentials,
  getFriendshipById,
  getFriendshipByUserIds,
  getUsersFriends,
  getUsersIncomingFriendRequests,
  getUsersOutgoingFriendRequests,
  getPost,
  getPostComments,
  getComment,
  getCommentReplies,
  getLike,
  getWall,
  getAboutOverviewByUserId,
  getWorkAndEducationByUserId,
  getWork,
  getUsersWorksCount,
  getSchool,
  getUsersSchoolsCount,
  getPlacesLivedByUserId,
  getUsersHometown,
  getUsersCurrentCity,
  getUsersCityCount,
  getCity,
  getContactInfoByUserId,
  getDetailsByUserId,
  getUsersFeed,
  createUser,
  createRefreshToken,
  createFederatedCredentials,
  createOauthToken,
  createFriendship,
  createRegularPost,
  createProfilePicUpdatePost,
  createComment,
  createLike,
  createWork,
  createSchool,
  createCity,
  createHometown,
  createCurrentCity,
  updateUser,
  updateRefreshToken,
  updateFriendship,
  updatePost,
  updateComment,
  updateWork,
  updateSchool,
  updateCity,
  updateContactInfo,
  updateDetails,
  deleteOauthToken,
  deleteFriendship,
  deletePost,
  deleteLike,
  softDeleteComment,
  deleteWork,
  deleteSchool,
  deleteCity,
  resetDatabase,
};
