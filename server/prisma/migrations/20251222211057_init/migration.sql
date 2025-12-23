-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PostType" AS ENUM ('REGULAR', 'PROFILE_PIC_UPDATE');

-- CreateEnum
CREATE TYPE "public"."LikeTargetType" AS ENUM ('POST', 'COMMENT');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(128) NOT NULL,
    "password" TEXT,
    "email" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rememberDevice" BOOLEAN NOT NULL DEFAULT false,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FederatedCredential" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,

    CONSTRAINT "FederatedCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OauthToken" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "OauthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Friendship" (
    "id" SERIAL NOT NULL,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstName" VARCHAR(64),
    "lastName" VARCHAR(64),
    "avatar" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkAndEducation" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "WorkAndEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Work" (
    "id" SERIAL NOT NULL,
    "company" VARCHAR(128) NOT NULL,
    "position" VARCHAR(128),
    "location" VARCHAR(128),
    "description" VARCHAR(256),
    "startYear" SMALLINT,
    "endYear" SMALLINT,
    "currentJob" BOOLEAN NOT NULL DEFAULT true,
    "workAndEducationId" INTEGER NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."School" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" VARCHAR(256),
    "degree" VARCHAR(128),
    "startYear" SMALLINT,
    "endYear" SMALLINT,
    "graduated" BOOLEAN NOT NULL DEFAULT true,
    "workAndEducationId" INTEGER NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlacesLived" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "PlacesLived_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."City" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "yearMoved" SMALLINT,
    "hometownId" INTEGER,
    "currentCityId" INTEGER,
    "placesLivedId" INTEGER,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContactInfo" (
    "id" SERIAL NOT NULL,
    "phoneNumbers" VARCHAR(32)[],
    "emails" VARCHAR(64)[],
    "websites" VARCHAR(128)[],
    "socialLinks" VARCHAR(128)[],
    "gender" "public"."Gender",
    "languages" VARCHAR(32)[],
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Birthday" (
    "id" SERIAL NOT NULL,
    "month" SMALLINT,
    "day" SMALLINT,
    "year" SMALLINT,
    "contactInfoId" INTEGER NOT NULL,

    CONSTRAINT "Birthday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DetailsAboutYou" (
    "id" SERIAL NOT NULL,
    "aboutMe" VARCHAR(1024),
    "quotes" VARCHAR(1024),
    "music" VARCHAR(1024),
    "books" VARCHAR(1024),
    "tv" VARCHAR(1024),
    "movies" VARCHAR(1024),
    "sports" VARCHAR(1024),
    "hobbies" VARCHAR(1024),
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "DetailsAboutYou_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" SERIAL NOT NULL,
    "type" "public"."PostType" NOT NULL DEFAULT 'REGULAR',
    "content" TEXT,
    "mediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" INTEGER NOT NULL,
    "wallId" INTEGER NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER,
    "postId" INTEGER NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Like" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetId" INTEGER NOT NULL,
    "targetType" "public"."LikeTargetType" NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "public"."RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "FederatedCredential_provider_providerId_key" ON "public"."FederatedCredential"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_user1Id_user2Id_key" ON "public"."Friendship"("user1Id", "user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkAndEducation_profileId_key" ON "public"."WorkAndEducation"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "PlacesLived_profileId_key" ON "public"."PlacesLived"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "City_hometownId_key" ON "public"."City"("hometownId");

-- CreateIndex
CREATE UNIQUE INDEX "City_currentCityId_key" ON "public"."City"("currentCityId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactInfo_profileId_key" ON "public"."ContactInfo"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Birthday_contactInfoId_key" ON "public"."Birthday"("contactInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "DetailsAboutYou_profileId_key" ON "public"."DetailsAboutYou"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_targetId_targetType_key" ON "public"."Like"("userId", "targetId", "targetType");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FederatedCredential" ADD CONSTRAINT "FederatedCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OauthToken" ADD CONSTRAINT "OauthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Friendship" ADD CONSTRAINT "Friendship_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Friendship" ADD CONSTRAINT "Friendship_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkAndEducation" ADD CONSTRAINT "WorkAndEducation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Work" ADD CONSTRAINT "Work_workAndEducationId_fkey" FOREIGN KEY ("workAndEducationId") REFERENCES "public"."WorkAndEducation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."School" ADD CONSTRAINT "School_workAndEducationId_fkey" FOREIGN KEY ("workAndEducationId") REFERENCES "public"."WorkAndEducation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlacesLived" ADD CONSTRAINT "PlacesLived_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_hometownId_fkey" FOREIGN KEY ("hometownId") REFERENCES "public"."PlacesLived"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_currentCityId_fkey" FOREIGN KEY ("currentCityId") REFERENCES "public"."PlacesLived"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."City" ADD CONSTRAINT "City_placesLivedId_fkey" FOREIGN KEY ("placesLivedId") REFERENCES "public"."PlacesLived"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactInfo" ADD CONSTRAINT "ContactInfo_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Birthday" ADD CONSTRAINT "Birthday_contactInfoId_fkey" FOREIGN KEY ("contactInfoId") REFERENCES "public"."ContactInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DetailsAboutYou" ADD CONSTRAINT "DetailsAboutYou_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_wallId_fkey" FOREIGN KEY ("wallId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
