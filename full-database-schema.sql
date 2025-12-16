-- Complete Database Schema for Rallly
-- Generated from Prisma migrations
-- Run this SQL script in your Supabase SQL Editor
-- 
-- Note: This includes all migrations in order.
-- Make sure you're running this on an empty database.


-- Migration 1: 20220315143815_init
-- CreateEnum
CREATE TYPE "PollType" AS ENUM ('date');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "urlId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "type" "PollType" NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "userId" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "timeZone" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "authorName" TEXT NOT NULL DEFAULT E'',
    "demo" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("urlId")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "pollId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Poll_urlId_key" ON "Poll"("urlId");

-- CreateIndex
CREATE UNIQUE INDEX "Poll_urlId_verificationCode_key" ON "Poll"("urlId", "verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_id_pollId_key" ON "Participant"("id", "pollId");

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("urlId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("urlId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("urlId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 2: 20220322193753_add_comments
-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Comment_id_pollId_key" ON "Comment"("id", "pollId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("urlId") ON DELETE RESTRICT ON UPDATE CASCADE;



-- Migration 3: 20220329102907_add_links
-- Create nanoid function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION nanoid(size int DEFAULT 21)
RETURNS text AS $$
DECLARE
  id text := '';
  i int := 0;
  urlAlphabet char(64) := 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';
  bytes bytea := gen_random_bytes(size);
  byte int;
  pos int;
BEGIN
  WHILE i < size LOOP
    byte := get_byte(bytes, i);
    pos := (byte & 63) + 1; -- + 1 because substr starts at 1 for some reason
    id := id || substr(urlAlphabet, pos, 1);
    i = i + 1;
  END LOOP;
  RETURN id;
END
$$ LANGUAGE PLPGSQL STABLE;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'participant');

-- CreateTable
CREATE TABLE "Link" (
    "urlId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "pollId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("urlId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Link_urlId_key" ON "Link"("urlId");

-- CreateIndex
CREATE UNIQUE INDEX "Link_pollId_role_key" ON "Link"("pollId", "role");

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("urlId") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Link" ("urlId", "pollId", "role") SELECT "urlId", "urlId", 'admin' as "role" FROM "Poll";
INSERT INTO "Link" ("urlId", "pollId", "role") SELECT nanoid(), "urlId", 'participant' as "role" FROM "Poll";


-- Migration 4: 20220330085423_add_notifications_column
-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "notifications" BOOLEAN NOT NULL DEFAULT false;



-- Migration 5: 20220408120721_legacy_column
-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "closed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "legacy" BOOLEAN NOT NULL DEFAULT false;



-- Migration 6: 20220412112814_cascade_delete
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pollId_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_pollId_fkey";

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_pollId_fkey";

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("urlId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("urlId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("urlId") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 7: 20220412115407_cascade_delete_participants
-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_pollId_fkey";

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("urlId") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 8: 20220412115744_cascade_delete_votes
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pollId_fkey";

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("urlId") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 9: 20220414101318_remove_duplicate_emails
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- We need to get rid of duplicate email addresses in the users table
-- because the index was previously case sensitive

-- First we update all polls created by users with a duplicate email address
-- to a single user
UPDATE "Poll" p SET "userId" = u.id
FROM (
	SELECT min(id) id, array_agg(id) as "userIds"
	FROM "User" u
	GROUP BY lower(email)
	HAVING count(*) > 1
) u
WHERE p."userId" = any(u."userIds")
AND p."userId" <> u.id;

-- Remove all users that do not have polls
DELETE FROM "User" u
WHERE NOT EXISTS (SELECT * FROM "Poll" p WHERE u.id = p."userId");

-- Add citext extension
CREATE EXTENSION IF NOT EXISTS citext;

-- Change email to citext
ALTER TABLE "User"
ALTER COLUMN email TYPE citext;



-- Migration 10: 20220506105524_sessions_update
/*
  Warnings:

  - You are about to drop the column `verificationCode` on the `Poll` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Poll_urlId_verificationCode_key";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "guestId" TEXT;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "guestId" TEXT;

-- AlterTable
ALTER TABLE "Poll" DROP COLUMN "verificationCode";



-- Migration 11: 20220511113020_add_if_need_be
-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('yes', 'no', 'ifNeedBe');

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "type" "VoteType" NOT NULL DEFAULT E'yes';



-- Migration 12: 20220511180705_naming_convention_update
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pollId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_pollId_fkey";

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_pollId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_pollId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Poll" DROP CONSTRAINT "Poll_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_optionId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_participantId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pollId_fkey";

-- Rename table
ALTER TABLE "Comment" RENAME TO "comments";

-- Rename table
ALTER TABLE "Link" RENAME TO "links";

-- Rename table
ALTER TABLE "Option" RENAME TO "options";

-- Rename table
ALTER TABLE "Participant" RENAME TO "participants";

-- Rename table
ALTER TABLE "Poll" RENAME TO "polls";

-- Rename table
ALTER TABLE "User" RENAME TO "users";

-- Rename table
ALTER TABLE "Vote" RENAME TO "votes";

-- Rename enum
ALTER TYPE "PollType" RENAME TO "poll_type";

-- Rename enum
ALTER TYPE "Role" RENAME TO "role";

-- Rename enum
ALTER TYPE "VoteType" RENAME TO "vote_type";

-- Rename fields
ALTER TABLE "comments" RENAME COLUMN "authorName" TO "author_name";
ALTER TABLE "comments" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "comments" RENAME COLUMN "guestId" TO "guest_id";
ALTER TABLE "comments" RENAME COLUMN "pollId" TO "poll_id";
ALTER TABLE "comments" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "comments" RENAME COLUMN "userId" TO "user_id";

-- Rename fields
ALTER TABLE "links" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "links" RENAME COLUMN "pollId" TO "poll_id";
ALTER TABLE "links" RENAME COLUMN "urlId" TO "url_id";

-- Rename fields
ALTER TABLE "options" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "options" RENAME COLUMN "pollId" TO "poll_id";
ALTER TABLE "options" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename fields
ALTER TABLE "participants" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "participants" RENAME COLUMN "guestId" TO "guest_id";
ALTER TABLE "participants" RENAME COLUMN "pollId" TO "poll_id";
ALTER TABLE "participants" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "participants" RENAME COLUMN "userId" TO "user_id";

-- Rename fields
ALTER TABLE "polls" RENAME COLUMN "authorName" TO "author_name";
ALTER TABLE "polls" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "polls" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "polls" RENAME COLUMN "timeZone" TO "time_zone";
ALTER TABLE "polls" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "polls" RENAME COLUMN "urlId" TO "url_id";

-- Rename fields
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename fields
ALTER TABLE "votes" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "votes" RENAME COLUMN "optionId" TO "option_id";
ALTER TABLE "votes" RENAME COLUMN "participantId" TO "participant_id";
ALTER TABLE "votes" RENAME COLUMN "pollId" TO "poll_id";
ALTER TABLE "votes" RENAME COLUMN "updatedAt" TO "updated_at";


-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "polls_url_id_key" ON "polls"("url_id");

-- CreateIndex
CREATE UNIQUE INDEX "links_url_id_key" ON "links"("url_id");

-- CreateIndex
CREATE UNIQUE INDEX "links_poll_id_role_key" ON "links"("poll_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "participants_id_poll_id_key" ON "participants"("id", "poll_id");

-- CreateIndex
CREATE UNIQUE INDEX "comments_id_poll_id_key" ON "comments"("id", "poll_id");

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("url_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("url_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("url_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("url_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("url_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "comments" RENAME CONSTRAINT "Comment_pkey" TO "comments_pkey";

-- AlterTable
ALTER TABLE "links" RENAME CONSTRAINT "Link_pkey" TO "links_pkey";

-- AlterTable
ALTER TABLE "options" RENAME CONSTRAINT "Option_pkey" TO "options_pkey";

-- AlterTable
ALTER TABLE "participants" RENAME CONSTRAINT "Participant_pkey" TO "participants_pkey";

-- AlterTable
ALTER TABLE "polls" RENAME CONSTRAINT "Poll_pkey" TO "polls_pkey";

-- AlterTable
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";

-- AlterTable
ALTER TABLE "votes" RENAME CONSTRAINT "Vote_pkey" TO "votes_pkey";



-- Migration 13: 20220512093441_add_no_votes
-- Previously we only stored "yes" and "ifNeedBe" votes and assumed missing votes are "no"
-- Since we want to differentiate between "no" and did not vote yet we want to include "no" votes
-- in this table
INSERT INTO votes (id, poll_id, participant_id, option_id, type)
SELECT nanoid(), poll_id, participant_id, option_id, 'no'
FROM (
  SELECT o.poll_id, p.id participant_id, o.id option_id
  FROM options o
  JOIN participants p ON o.poll_id = p.poll_id
EXCEPT
  SELECT poll_id, participant_id, option_id
  FROM votes
) AS missing;



-- Migration 14: 20220519075453_add_delete_column
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_poll_id_fkey";

-- DropForeignKey
ALTER TABLE "links" DROP CONSTRAINT "links_poll_id_fkey";

-- DropForeignKey
ALTER TABLE "options" DROP CONSTRAINT "options_poll_id_fkey";

-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_poll_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_option_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_poll_id_fkey";

-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("url_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("url_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("url_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("url_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("url_id") ON DELETE RESTRICT ON UPDATE CASCADE;



-- Migration 15: 20220520115326_add_touch_column
-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "touched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;



-- Migration 16: 20220522153812_change_referential_integrity
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_poll_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "links" DROP CONSTRAINT "links_poll_id_fkey";

-- DropForeignKey
ALTER TABLE "options" DROP CONSTRAINT "options_poll_id_fkey";

-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_poll_id_fkey";

-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_user_id_fkey";

-- DropForeignKey
ALTER TABLE "polls" DROP CONSTRAINT "polls_user_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_option_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_participant_id_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_poll_id_fkey";



-- Migration 17: 20220522165453_add_deleted_at_column
-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "deleted_at" TIMESTAMP(3);

UPDATE "polls" SET "deleted_at" = now() WHERE "deleted" = true;


-- Migration 18: 20220623175037_remove_links_model
-- AlterTable
ALTER TABLE "polls"
ADD COLUMN "admin_url_id" TEXT,
ADD COLUMN "participant_url_id" TEXT;

UPDATE polls
	SET participant_url_id=(SELECT url_id FROM links WHERE polls.url_id=links.poll_id AND links."role"='participant');

UPDATE polls
	SET admin_url_id=(SELECT url_id FROM links WHERE polls.url_id=links.poll_id AND links."role"='admin');

ALTER TABLE "polls"
ALTER COLUMN "admin_url_id" SET NOT NULL,
ALTER COLUMN "participant_url_id" SET NOT NULL;

-- DropTable
DROP TABLE "links";

-- DropEnum
DROP TYPE "role";

-- CreateIndex
CREATE UNIQUE INDEX "polls_participant_url_id_key" ON "polls"("participant_url_id");

-- CreateIndex
CREATE UNIQUE INDEX "polls_admin_url_id_key" ON "polls"("admin_url_id");



-- Migration 19: 20220624111614_rename_poll_id
/*
  Warnings:

  - The primary key for the `polls` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `url_id` on the `polls` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `polls` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `polls` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Poll_urlId_key";

-- DropIndex
DROP INDEX "polls_url_id_key";

-- AlterTable
ALTER TABLE "polls"
RENAME COLUMN "url_id" TO "id";

-- CreateIndex
CREATE UNIQUE INDEX "polls_id_key" ON "polls"("id");



-- Migration 20: 20220627191901_remove_user_relation
/*
  Warnings:

  - You are about to drop the column `guest_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `guest_id` on the `participants` table. All the data in the column will be lost.

*/
-- Set user_id to guest_id
UPDATE "comments"
SET "user_id" = "guest_id"
WHERE "user_id" IS NULL;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "guest_id";

-- Set user_id to guest_id
UPDATE "participants"
SET "user_id" = "guest_id"
WHERE "user_id" IS NULL;

-- AlterTable
ALTER TABLE "participants" DROP COLUMN "guest_id";



-- Migration 21: 20221026220835_add_indexes
-- CreateIndex
CREATE INDEX "participants_poll_id_idx" ON "participants" USING HASH ("poll_id");

-- CreateIndex
CREATE INDEX "votes_participant_id_idx" ON "votes" USING HASH ("participant_id");



-- Migration 22: 20230117103853_update_indexes
-- DropIndex
DROP INDEX "Participant_id_pollId_key";

-- DropIndex
DROP INDEX "participants_id_poll_id_key";

-- CreateIndex
CREATE INDEX "comments_poll_id_idx" ON "comments" USING HASH ("poll_id");

-- CreateIndex
CREATE INDEX "options_poll_id_idx" ON "options" USING HASH ("poll_id");

-- CreateIndex
CREATE INDEX "polls_user_id_idx" ON "polls" USING HASH ("user_id");

-- CreateIndex
CREATE INDEX "votes_poll_id_idx" ON "votes" USING HASH ("poll_id");



-- Migration 23: 20230118192253_bring_back_comment_index
-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments" USING HASH ("user_id");



-- Migration 24: 20230118200546_add_unqiue_participant
/*
  Warnings:

  - A unique constraint covering the columns `[id,poll_id]` on the table `participants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "participants_id_poll_id_key" ON "participants"("id", "poll_id");



-- Migration 25: 20230303142641_add_participant_email
-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "email" TEXT;



-- Migration 26: 20230318113511_remove_unecessary_unique_indexes
-- DropIndex
DROP INDEX "Comment_id_pollId_key";

-- DropIndex
DROP INDEX "comments_id_poll_id_key";

-- DropIndex
DROP INDEX "participants_id_poll_id_key";



-- Migration 27: 20230322143831_watchers
-- CreateTable
CREATE TABLE "watchers" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchers_pkey" PRIMARY KEY ("id")
);

INSERT INTO watchers (poll_id, user_id)
SELECT id AS poll_id, user_id AS user_id
FROM polls
WHERE notifications = true;

-- AlterTable
ALTER TABLE "polls" DROP COLUMN "notifications",
ALTER COLUMN "author_name" DROP NOT NULL,
ALTER COLUMN "author_name" DROP DEFAULT,
DROP COLUMN "verified";

-- CreateIndex
CREATE INDEX "watchers_poll_id_idx" ON "watchers" USING HASH ("poll_id");
CREATE INDEX "watchers_user_id_idx" ON "watchers" USING HASH ("user_id");



-- Migration 28: 20230327105647_remove_author_name
/*
  Warnings:

  - You are about to drop the column `author_name` on the `polls` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "polls" DROP COLUMN "author_name";



-- Migration 29: 20230329173551_options_refactor
-- AlterTable
ALTER TABLE "options"
ADD COLUMN     "duration_minutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "start" TIMESTAMP(0);

-- AlterTable
ALTER TABLE "polls" DROP COLUMN "type";

-- DropEnum
DROP TYPE "poll_type";

-- Reformat option value into new columns
UPDATE "options"
SET "start" = CASE
    WHEN POSITION('/' IN "value") = 0 THEN (value || 'T00:00:00')::TIMESTAMP WITHOUT TIME ZONE
    ELSE SPLIT_PART("value", '/', 1)::TIMESTAMP WITHOUT TIME ZONE
  END,
   "duration_minutes" = CASE
    WHEN POSITION('/' IN "value") = 0 THEN 0
    ELSE
      LEAST(EXTRACT(EPOCH FROM (split_part("value", '/', 2)::timestamp - split_part("value", '/', 1)::timestamp)) / 60, 1440)
  END;

-- Fix cases where we have a negative duration due to the end time being in the past
-- eg. Some polls have value 2023-03-29T23:00:00/2023-03-29T01:00:00
UPDATE "options"
SET "duration_minutes" = "duration_minutes" + 1440
WHERE "duration_minutes" < 0;

-- Set start date to be not null now that we have all the data and drop the old value column
ALTER TABLE "options"
DROP COLUMN "value",
DROP COLUMN "updated_at",
ALTER COLUMN "start" SET NOT NULL;




-- Migration 30: 20230614141138_v3
-- CreateEnum
CREATE TYPE "time_format" AS ENUM ('hours12', 'hours24');

-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "event_id" TEXT,
ADD COLUMN     "selected_option_id" TEXT;

-- CreateTable
CREATE TABLE "user_preferences" (
    "user_id" TEXT NOT NULL,
    "time_zone" TEXT,
    "week_start" INTEGER,
    "time_format" "time_format",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(0) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_poll_id_key" ON "events"("poll_id");

-- CreateIndex
CREATE INDEX "events_poll_id_idx" ON "events" USING HASH ("poll_id");

-- CreateIndex
CREATE INDEX "events_user_id_idx" ON "events" USING HASH ("user_id");



-- Migration 31: 20230615111329_events
/*
  Warnings:

  - Added the required column `option_id` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "option_id" TEXT NOT NULL;



-- Migration 32: 20230615163229_remove_selected_option_id
/*
  Warnings:

  - You are about to drop the column `selected_option_id` on the `polls` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "polls" DROP COLUMN "selected_option_id";



-- Migration 33: 20230704153346_user_payments
-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('active', 'paused', 'deleted', 'trialing', 'past_due');

-- CreateTable
CREATE TABLE "user_payment_data" (
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "subscription_status" NOT NULL,
    "update_url" TEXT NOT NULL,
    "cancel_url" TEXT NOT NULL,

    CONSTRAINT "user_payment_data_pkey" PRIMARY KEY ("user_id")
);



-- Migration 34: 20230721163042_hide_participants
-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "hide_participants" BOOLEAN NOT NULL DEFAULT false;



-- Migration 35: 20230725112615_add_poll_config
-- CreateEnum
CREATE TYPE "participant_visibility" AS ENUM ('full', 'scoresOnly', 'limited');

-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "disable_comments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hide_scores" BOOLEAN NOT NULL DEFAULT false;



-- Migration 36: 20230823084154_stripe_subscriptions
/*
  Warnings:

  - A unique constraint covering the columns `[subscription_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "customer_id" TEXT,
ADD COLUMN     "subscription_id" TEXT;

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "price_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "currency" TEXT,
    "interval" TEXT,
    "interval_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_subscription_id_key" ON "users"("subscription_id");



-- Migration 37: 20230915170216_add_required_email
-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "require_participant_email" BOOLEAN NOT NULL DEFAULT false;



-- Migration 38: 20231016093654_next_auth
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified" TIMESTAMP(3),
ADD COLUMN     "locale" TEXT,
ADD COLUMN     "time_format" "time_format",
ADD COLUMN     "time_zone" TEXT,
ADD COLUMN     "week_start" INTEGER;

-- Copy user preferences from old table
UPDATE "users" u
SET 
  "time_zone" = up."time_zone",
  "week_start" = up."week_start",
  "time_format" = up."time_format"
FROM "user_preferences" up
WHERE u.id = up."user_id";

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");



-- Migration 39: 20231027074632_nextauth_ci_identifiers
-- AlterTable
ALTER TABLE "verification_tokens" ALTER COLUMN "identifier" SET DATA TYPE CITEXT;



-- Migration 40: 20231117153753_add_nextauth_provider_accounts
-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");



-- Migration 41: 20231118134458_add_account_user_index
-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account" USING HASH ("userId");



-- Migration 42: 20231122061137_map_account_table_names
/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Account";

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING HASH ("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");



-- Migration 43: 20231205043530_poll_status
/*
  Warnings:

  - You are about to drop the column `demo` on the `polls` table. All the data in the column will be lost.
  - You are about to drop the column `legacy` on the `polls` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[event_id]` on the table `polls` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "poll_status" AS ENUM ('live', 'paused', 'finalized');

-- AlterTable
ALTER TABLE "polls" DROP COLUMN "demo",
DROP COLUMN "legacy",
ADD COLUMN     "status" "poll_status";

-- CreateIndex
CREATE UNIQUE INDEX "polls_event_id_key" ON "polls"("event_id");

-- Fix an issue where the "event_id" column was not being set
UPDATE "polls"
SET "event_id" = "events"."id"
FROM "events"
WHERE "events"."poll_id" = "polls"."id";

-- Set the "status" column to corressponding enum value
-- If "closed" is true, set to "paused"
-- If a poll has an "event_id", set to "finalized"
-- If a poll has a "deletedAt" date, set to "deleted"
-- Otherwise set to "live"
UPDATE "polls"
SET "status" = CASE
  WHEN "closed" = true THEN 'paused'::poll_status
  WHEN "event_id" IS NOT NULL THEN 'finalized'::poll_status
  ELSE 'live'::poll_status
END;

-- Make the "status" column non-nullable and default to "live"
ALTER TABLE "polls"
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'live';


DROP INDEX "events_poll_id_idx";

-- DropIndex
DROP INDEX "events_poll_id_key";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "poll_id";


-- Migration 44: 20231205080854_fix_finalized_poll_status
/*
  Fixes an issue in the previous migration where paused polls were not being
  set to finalized if they had an event_id.
*/
-- Set "status" to "finalized" if "event_id" is not null
UPDATE "polls"
SET "status" = 'finalized'::poll_status
WHERE "event_id" IS NOT NULL;



-- Migration 45: 20240127064213_add_image_field
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image" TEXT;



-- Migration 46: 20240221084400_unset_invalid_timezones
-- Unset non-geographic time zones
UPDATE users SET time_zone = NULL WHERE time_zone NOT LIKE '%/%' OR time_zone LIKE 'Etc/%';



-- Migration 47: 20240224011353_remove_legacy_user_preferences
-- DropTable
DROP TABLE "user_preferences";



-- Migration 48: 20240224033808_option_start_time
-- AlterTable
ALTER TABLE "options" ADD COLUMN     "start_time" TIMESTAMP(0);

-- migration.sql
DO
$do$
DECLARE
   poll_record RECORD;
BEGIN
   FOR poll_record IN SELECT id, "time_zone" FROM polls
   LOOP
      IF poll_record."time_zone" IS NULL OR poll_record."time_zone" = '' THEN
         UPDATE options
         SET "start_time" = "start"
         WHERE "poll_id" = poll_record.id;
      ELSE
         UPDATE options
         SET "start_time" = ("start"::TIMESTAMP WITHOUT TIME ZONE) AT TIME ZONE poll_record.time_zone
         WHERE "poll_id" = poll_record.id;
      END IF;
   END LOOP;
END
$do$;

-- Make start_time not null
ALTER TABLE "options" ALTER COLUMN "start_time" SET NOT NULL;




-- Migration 49: 20240309043111_remove_poll_vote_index
-- DropIndex
DROP INDEX "votes_poll_id_idx";



-- Migration 50: 20240309051319_add_option_vote_index
-- CreateIndex
CREATE INDEX "votes_option_id_idx" ON "votes" USING HASH ("option_id");



-- Migration 51: 20240315104329_index_votes_by_poll
-- CreateIndex
CREATE INDEX "votes_poll_id_idx" ON "votes" USING HASH ("poll_id");



-- Migration 52: 20240317095541_remove_legacy_start_column
/*
  Warnings:

  - You are about to drop the column `start` on the `options` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "options" DROP COLUMN "start";



-- Migration 53: 20240704085250_soft_delete_participants
-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deleted_at" TIMESTAMP(3);



-- Migration 54: 20240901171230_participant_locale
-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "locale" TEXT;



-- Migration 55: 20241224103150_guest_id_column
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "guest_id" TEXT;

-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "guest_id" TEXT;

-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "guest_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "comments_guest_id_idx" ON "comments" USING HASH ("guest_id");

-- CreateIndex
CREATE INDEX "participants_guest_id_idx" ON "participants" USING HASH ("guest_id");

-- CreateIndex
CREATE INDEX "polls_guest_id_idx" ON "polls" USING HASH ("guest_id");

-- Migrate polls
UPDATE "polls" p
SET 
    "guest_id" = CASE 
        WHEN NOT EXISTS (SELECT 1 FROM "users" u WHERE u.id = p.user_id) THEN p.user_id 
        ELSE NULL 
    END,
    "user_id" = CASE 
        WHEN NOT EXISTS (SELECT 1 FROM "users" u WHERE u.id = p.user_id) THEN NULL 
        ELSE p.user_id 
    END
WHERE p.user_id IS NOT NULL;

-- Migrate participants
UPDATE "participants" p
SET 
    "guest_id" = CASE 
        WHEN NOT EXISTS (SELECT 1 FROM "users" u WHERE u.id = p.user_id) THEN p.user_id 
        ELSE NULL 
    END,
    "user_id" = CASE 
        WHEN NOT EXISTS (SELECT 1 FROM "users" u WHERE u.id = p.user_id) THEN NULL 
        ELSE p.user_id 
    END
WHERE p.user_id IS NOT NULL;

-- Migrate comments
UPDATE "comments" c
SET 
    "guest_id" = CASE 
        WHEN NOT EXISTS (SELECT 1 FROM "users" u WHERE u.id = c.user_id) THEN c.user_id 
        ELSE NULL 
    END,
    "user_id" = CASE 
        WHEN NOT EXISTS (SELECT 1 FROM "users" u WHERE u.id = c.user_id) THEN NULL 
        ELSE c.user_id 
    END
WHERE c.user_id IS NOT NULL;



-- Migration 56: 20241228093234_update_relational_model
-- Clean up polls
DELETE FROM polls 
WHERE user_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = polls.user_id);

-- Clean up participants
DELETE FROM participants pa
WHERE NOT EXISTS (
  SELECT 1 FROM polls p 
  WHERE p.id = pa.poll_id
);

DELETE FROM participants 
WHERE user_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = participants.user_id);

-- Clean up options
DELETE FROM options o
WHERE NOT EXISTS (
  SELECT 1 FROM polls p 
  WHERE p.id = o.poll_id
);

-- Clean up votes
DELETE FROM votes v
WHERE NOT EXISTS (
  SELECT 1 FROM polls p 
  WHERE p.id = v.poll_id
);

DELETE FROM votes v
WHERE NOT EXISTS (
  SELECT 1 FROM participants p 
  WHERE p.poll_id = v.poll_id
  AND p.id = v.participant_id
);

DELETE FROM votes v
WHERE NOT EXISTS (
  SELECT 1 FROM options o 
  WHERE o.poll_id = v.poll_id
  AND o.id = v.option_id
);

-- Clean up comments
DELETE FROM comments c
WHERE NOT EXISTS (
  SELECT 1 FROM polls p 
  WHERE p.id = c.poll_id
);

DELETE FROM comments 
WHERE user_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = comments.user_id);

-- Clean up watchers
DELETE FROM watchers w
WHERE NOT EXISTS (
  SELECT 1 FROM polls p 
  WHERE p.id = w.poll_id
);

DELETE FROM watchers 
WHERE user_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = watchers.user_id);

-- Clean up events
DELETE FROM events 
WHERE user_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = events.user_id);

-- Handle subscription updates
UPDATE users 
SET subscription_id = NULL 
WHERE subscription_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.id = users.subscription_id);

-- DropIndex
DROP INDEX "accounts_user_id_idx";

-- DropIndex
DROP INDEX "comments_user_id_idx";

-- DropIndex
DROP INDEX "polls_guest_id_idx";

-- DropIndex
DROP INDEX "polls_user_id_idx";

-- DropIndex
DROP INDEX "watchers_user_id_idx";

-- CreateIndex
CREATE INDEX "polls_guest_id_idx" ON "polls"("guest_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchers" ADD CONSTRAINT "watchers_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchers" ADD CONSTRAINT "watchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 57: 20250217082042_add_subscription_fields
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "status" TEXT;



-- Migration 58: 20250217103625_make_subscription_fields_required
/*
  Warnings:

  - You are about to drop the column `interval_count` on the `subscriptions` table. All the data in the column will be lost.
  - Made the column `currency` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `interval` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "interval_count",
ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "interval" SET NOT NULL,
ALTER COLUMN "amount" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL;



-- Migration 59: 20250221104854_add_cancel_at_period_end
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false;



-- Migration 60: 20250221111248_add_subscription_interval_enum
-- Create the enum type
CREATE TYPE subscription_interval AS ENUM ('day', 'week', 'month', 'year');

-- Add the new column
ALTER TABLE subscriptions ADD COLUMN interval_enum subscription_interval;

-- Populate the new column
UPDATE subscriptions 
SET interval_enum = CASE 
    WHEN interval = 'month' THEN 'month'::subscription_interval
    WHEN interval = 'year' THEN 'year'::subscription_interval
    ELSE NULL 
END;

-- Make the new column required
ALTER TABLE subscriptions ALTER COLUMN interval_enum SET NOT NULL;

-- Drop the old column
ALTER TABLE subscriptions DROP COLUMN interval;

-- Rename the new column to interval
ALTER TABLE subscriptions RENAME COLUMN interval_enum TO interval;



-- Migration 61: 20250222172325_add_payment_method_table
-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 62: 20250223160003_set_subscription_status_enum
-- Add new enum values in a transaction
BEGIN;
ALTER TYPE "subscription_status" ADD VALUE 'incomplete';
ALTER TYPE "subscription_status" ADD VALUE 'incomplete_expired';
ALTER TYPE "subscription_status" ADD VALUE 'canceled';
ALTER TYPE "subscription_status" ADD VALUE 'unpaid';
COMMIT;

-- Now we can safely use the new enum values
-- AlterTable
ALTER TABLE "subscriptions" 
ADD COLUMN "status_enum" "subscription_status";

-- Migrate existing data
UPDATE "subscriptions" 
SET "status_enum" = "status"::"subscription_status";

-- Make the new column required
ALTER TABLE "subscriptions" 
ALTER COLUMN "status_enum" SET NOT NULL;

-- Drop the old column
ALTER TABLE "subscriptions" 
DROP COLUMN "status";

-- Rename the new column
ALTER TABLE "subscriptions"
RENAME COLUMN "status_enum" TO "status";



-- Migration 63: 20250226173250_remove_paddle_subscriptions
-- DropTable
DROP TABLE "user_payment_data";

-- AlterEnum
BEGIN;
CREATE TYPE "subscription_status_new" AS ENUM ('incomplete', 'incomplete_expired', 'active', 'paused', 'trialing', 'past_due', 'canceled', 'unpaid');
ALTER TABLE "subscriptions" ALTER COLUMN "status" TYPE "subscription_status_new" USING ("status"::text::"subscription_status_new");
ALTER TYPE "subscription_status" RENAME TO "subscription_status_old";
ALTER TYPE "subscription_status_new" RENAME TO "subscription_status";
DROP TYPE "subscription_status_old";
COMMIT;


-- Migration 64: 20250227110115_make_subscription_user_required
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_subscription_id_fkey";

-- DropIndex
DROP INDEX "users_subscription_id_key";

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "user_id" TEXT;

-- Populate user_id in subscriptions table using data from users table
UPDATE "subscriptions" s
SET "user_id" = u.id
FROM "users" u
WHERE u."subscription_id" = s.id;

-- Delete orphaned subscriptions (subscriptions without a corresponding user)
DELETE FROM "subscriptions" 
WHERE "user_id" IS NULL;

-- Make user_id NOT NULL after populating data
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "subscription_id";

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 65: 20250302163530_add_user_ban_fields
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ban_reason" TEXT,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "banned_at" TIMESTAMP(3);



-- Migration 66: 20250327193922_track_poll_views
-- CreateTable
CREATE TABLE "poll_views" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_id" TEXT,
    "user_agent" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "poll_views_poll_id_idx" ON "poll_views" USING HASH ("poll_id");

-- CreateIndex
CREATE INDEX "poll_views_user_id_idx" ON "poll_views" USING HASH ("user_id");

-- CreateIndex
CREATE INDEX "poll_views_viewed_at_idx" ON "poll_views"("viewed_at");

-- AddForeignKey
ALTER TABLE "poll_views" ADD CONSTRAINT "poll_views_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_views" ADD CONSTRAINT "poll_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- Migration 67: 20250402100733_remove_closed_column
/*
  Warnings:

  - You are about to drop the column `closed` on the `polls` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "polls" DROP COLUMN "closed";



-- Migration 68: 20250415153024_scheduled_events
-- CreateEnum
CREATE TYPE "scheduled_event_status" AS ENUM ('confirmed', 'canceled', 'unconfirmed');

-- CreateEnum
CREATE TYPE "scheduled_event_invite_status" AS ENUM ('pending', 'accepted', 'declined', 'tentative');

-- CreateTable
CREATE TABLE "scheduled_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "scheduled_event_status" NOT NULL DEFAULT 'confirmed',
    "time_zone" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "scheduled_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rescheduled_event_dates" (
    "id" TEXT NOT NULL,
    "scheduled_event_id" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rescheduled_event_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_event_invites" (
    "id" TEXT NOT NULL,
    "scheduled_event_id" TEXT NOT NULL,
    "invitee_name" TEXT NOT NULL,
    "invitee_email" TEXT NOT NULL,
    "invitee_id" TEXT,
    "invitee_time_zone" TEXT,
    "status" "scheduled_event_invite_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_event_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rescheduled_event_dates_scheduled_event_id_idx" ON "rescheduled_event_dates"("scheduled_event_id");

-- CreateIndex
CREATE INDEX "scheduled_event_invites_scheduled_event_id_idx" ON "scheduled_event_invites"("scheduled_event_id");

-- CreateIndex
CREATE INDEX "scheduled_event_invites_invitee_id_idx" ON "scheduled_event_invites"("invitee_id");

-- CreateIndex
CREATE INDEX "scheduled_event_invites_invitee_email_idx" ON "scheduled_event_invites"("invitee_email");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_event_invites_scheduled_event_id_invitee_email_key" ON "scheduled_event_invites"("scheduled_event_id", "invitee_email");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_event_invites_scheduled_event_id_invitee_id_key" ON "scheduled_event_invites"("scheduled_event_id", "invitee_id");

-- AddForeignKey
ALTER TABLE "scheduled_events" ADD CONSTRAINT "scheduled_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rescheduled_event_dates" ADD CONSTRAINT "rescheduled_event_dates_scheduled_event_id_fkey" FOREIGN KEY ("scheduled_event_id") REFERENCES "scheduled_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_event_invites" ADD CONSTRAINT "scheduled_event_invites_scheduled_event_id_fkey" FOREIGN KEY ("scheduled_event_id") REFERENCES "scheduled_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_event_invites" ADD CONSTRAINT "scheduled_event_invites_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "scheduled_event_id" TEXT;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_scheduled_event_id_fkey" FOREIGN KEY ("scheduled_event_id") REFERENCES "scheduled_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- Migration 69: 20250415155219_migrate_events
-- Step 1: Insert data from Event into ScheduledEvent
-- Reuse Event ID for ScheduledEvent ID
-- Calculate 'end': For all-day (duration 0), end is start + 1 day. Otherwise, calculate based on duration.
-- Set 'all_day' based on 'duration_minutes'
-- Fetch 'location' and 'time_zone' from the related Poll using event_id
-- Set defaults for other fields
INSERT INTO "scheduled_events" (
    "id",
    "user_id",
    "title",
    "description",
    "location",
    "created_at",
    "updated_at",
    "status",
    "time_zone",
    "start",
    "end",
    "all_day",
    "deleted_at"
)
SELECT
    e."id",                                     -- Reuse Event ID
    e."user_id",
    e."title",
    NULL,                                       -- Default description
    p."location",                               -- Get location from the related Poll
    e."created_at",
    NOW(),                                      -- Set updated_at to current time
    'confirmed'::"scheduled_event_status",      -- Default status 'confirmed'
    p."time_zone",                              -- Get timeZone from the related Poll
    e."start",
    -- Calculate 'end': If duration is 0 (all-day), set end to start + 1 day. Otherwise, calculate based on duration.
    CASE
        WHEN e."duration_minutes" = 0 THEN e."start" + interval '1 day'
        ELSE e."start" + (e."duration_minutes" * interval '1 minute')
    END,
    -- Set 'all_day': TRUE if duration is 0, FALSE otherwise
    CASE
        WHEN e."duration_minutes" = 0 THEN TRUE
        ELSE FALSE
    END,
    NULL                                        -- Default deletedAt to NULL
FROM
    "events" e
    LEFT JOIN "polls" p ON e."id" = p."event_id";
-- Step 2: Update the polls table to link to the new scheduled_event_id
-- Set scheduled_event_id = event_id where event_id was previously set
-- Only update if the corresponding ScheduledEvent was successfully created in Step 1
UPDATE "polls" p
SET "scheduled_event_id" = p."event_id"
WHERE p."event_id" IS NOT NULL;


-- Migration 70: 20250421170921_migrate_invites
-- migrate_event_votes_to_invites.sql V7
-- Migrate participants with emails from polls linked to events with a selected winning option (event.optionId)
-- into scheduled_event_invites for the corresponding scheduled_event (poll.scheduled_event_id).
-- Map the participant's vote on the winning option to the invite status.
-- Uses CTE with ROW_NUMBER() to handle potential duplicates based on email *and* user_id per scheduled event, preferring the most recent participant.
-- Uses NOT EXISTS in WHERE clause to avoid inserting invites if they already exist from other sources.
-- Reuses the participant's unique ID (pt.id) as the invite ID for this migration.
-- Excludes participants with NULL or empty string emails.

WITH PotentialInvites AS (
    SELECT
        pt.id as participant_id, -- Keep original participant ID for reuse
        p.scheduled_event_id,
        pt.name as invitee_name,
        pt.email as invitee_email,
        pt.user_id as invitee_id,
        u.time_zone as invitee_time_zone,
        v.type as vote_type,
        pt.created_at as participant_created_at,
        -- Assign row number partitioned by event and email, preferring most recent participant
        ROW_NUMBER() OVER(PARTITION BY p.scheduled_event_id, pt.email ORDER BY pt.created_at DESC) as rn_email,
        -- Assign row number partitioned by event and user_id (if not null), preferring most recent participant
        CASE
            WHEN pt.user_id IS NOT NULL THEN ROW_NUMBER() OVER(PARTITION BY p.scheduled_event_id, pt.user_id ORDER BY pt.created_at DESC)
            ELSE NULL
        END as rn_user
    FROM
        events e
    JOIN
        polls p ON e.id = p.event_id
    JOIN
        participants pt ON p.id = pt.poll_id
    LEFT JOIN
        votes v ON pt.id = v.participant_id AND e.option_id = v.option_id
    LEFT JOIN
        users u ON pt.user_id = u.id
    WHERE
        e.option_id IS NOT NULL
        AND p.scheduled_event_id IS NOT NULL
        AND pt.email IS NOT NULL
        AND pt.email != ''
        AND pt.deleted = false
)
INSERT INTO scheduled_event_invites (
    id,
    scheduled_event_id,
    invitee_name,
    invitee_email,
    invitee_id,
    invitee_time_zone,
    status,
    created_at,
    updated_at
)
SELECT
    pi.participant_id as id, -- Reuse participant's unique CUID as invite ID
    pi.scheduled_event_id,
    pi.invitee_name,
    pi.invitee_email,
    pi.invitee_id,
    pi.invitee_time_zone,
    CASE pi.vote_type
        WHEN 'yes' THEN 'accepted'::scheduled_event_invite_status
        WHEN 'ifNeedBe' THEN 'tentative'::scheduled_event_invite_status
        WHEN 'no' THEN 'declined'::scheduled_event_invite_status
        ELSE 'pending'::scheduled_event_invite_status
    END as status,
    NOW() as created_at,
    NOW() as updated_at
FROM
    PotentialInvites pi
WHERE
    pi.rn_email = 1 -- Only take the first row for each email/event combo
    AND (pi.invitee_id IS NULL OR pi.rn_user = 1) -- Only take the first row for each user_id/event combo (if user_id exists)
    -- Check for existing invite by email for the same scheduled event
    AND NOT EXISTS (
        SELECT 1
        FROM scheduled_event_invites sei
        WHERE sei.scheduled_event_id = pi.scheduled_event_id
          AND sei.invitee_email = pi.invitee_email
    )
    -- Check for existing invite by user ID for the same scheduled event (only if participant has a user ID)
    AND (pi.invitee_id IS NULL OR NOT EXISTS (
        SELECT 1
        FROM scheduled_event_invites sei
        WHERE sei.scheduled_event_id = pi.scheduled_event_id
          AND sei.invitee_id = pi.invitee_id
    ));


-- Migration 71: 20250522093338_add_user_role
-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'user');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "user_role" NOT NULL DEFAULT 'user';



-- Migration 72: 20250522165415_licensing_schema
-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('PLUS', 'ORGANIZATION', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "license_key" TEXT NOT NULL,
    "version" INTEGER,
    "type" "LicenseType" NOT NULL,
    "seats" INTEGER,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "licensee_email" TEXT,
    "licensee_name" TEXT,
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripe_customer_id" TEXT,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_validations" (
    "id" TEXT NOT NULL,
    "license_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "fingerprint" TEXT,
    "validated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_agent" TEXT,

    CONSTRAINT "license_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instance_licenses" (
    "id" TEXT NOT NULL,
    "license_key" TEXT NOT NULL,
    "version" INTEGER,
    "type" "LicenseType" NOT NULL,
    "seats" INTEGER,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "licensee_email" TEXT,
    "licensee_name" TEXT,
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "instance_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "licenses_license_key_key" ON "licenses"("license_key");

-- CreateIndex
CREATE UNIQUE INDEX "instance_licenses_license_key_key" ON "instance_licenses"("license_key");

-- AddForeignKey
ALTER TABLE "license_validations" ADD CONSTRAINT "license_validations_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 73: 20250523161200_remove_invitee_constraints
-- DropIndex
DROP INDEX "scheduled_event_invites_scheduled_event_id_invitee_email_key";

-- DropIndex
DROP INDEX "scheduled_event_invites_scheduled_event_id_invitee_id_key";



-- Migration 74: 20250526175615_remove_stripe_customer_id
/*
  Warnings:

  - You are about to drop the column `stripe_customer_id` on the `licenses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "licenses" DROP COLUMN "stripe_customer_id";



-- Migration 75: 20250602144531_add_instance_settings
-- CreateTable
CREATE TABLE "instance_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "disable_user_registration" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instance_settings_pkey" PRIMARY KEY ("id")
);

-- Create default instance settings
INSERT INTO "instance_settings" ("id", "disable_user_registration") VALUES (1, false);



-- Migration 76: 20250602181052_add_instance_settings_constraints
ALTER TABLE "instance_settings"
  ADD CONSTRAINT instance_settings_singleton CHECK (id = 1);

CREATE OR REPLACE FUNCTION prevent_delete_instance_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.id = 1 THEN
    RAISE EXCEPTION 'Deleting the instance_settings record (id=1) is not permitted.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_instance_settings_deletion
BEFORE DELETE ON instance_settings
FOR EACH ROW EXECUTE FUNCTION prevent_delete_instance_settings();



-- Migration 77: 20250614062854_remove_deprecated_event_model
/*
  Warnings:

  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_user_id_fkey";

-- DropForeignKey
ALTER TABLE "polls" DROP CONSTRAINT "polls_event_id_fkey";

-- DropTable
DROP TABLE "events";



-- Migration 78: 20250614062855_create_spaces_model
/*
  Warnings:

  - A unique constraint covering the columns `[space_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "space_id" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "space_id" TEXT;

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_space_id_key" ON "subscriptions"("space_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 79: 20250614110551_create_spaces
INSERT INTO spaces (id, name, owner_id, created_at, updated_at)
SELECT gen_random_uuid(), 'Personal', id, NOW(), NOW()
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM spaces WHERE spaces.owner_id = users.id
) ON CONFLICT DO NOTHING;

-- Set space_id for polls
UPDATE polls
SET space_id = spaces.id
FROM spaces
WHERE polls.user_id = spaces.owner_id AND polls.space_id IS NULL;

UPDATE subscriptions
SET space_id = spaces.id
FROM spaces
WHERE subscriptions.user_id = spaces.owner_id AND subscriptions.space_id IS NULL;


-- Migration 80: 20250614115818_migrate_events_to_spaces
/*
  Warnings:

  - Added the required column `space_id` to the `scheduled_events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scheduled_events" ADD COLUMN     "space_id" TEXT;

-- AddForeignKey
ALTER TABLE "scheduled_events" ADD CONSTRAINT "scheduled_events_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "scheduled_events" SET "space_id" = (SELECT "id" FROM "spaces" WHERE "owner_id" = "scheduled_events"."user_id" LIMIT 1);

ALTER TABLE "scheduled_events" ALTER COLUMN "space_id" SET NOT NULL;



-- Migration 81: 20250615114214_update_indexes
-- DropIndex
DROP INDEX "comments_guest_id_idx";

-- DropIndex
DROP INDEX "participants_guest_id_idx";

-- DropIndex
DROP INDEX "polls_guest_id_idx";

-- CreateIndex
CREATE INDEX "polls_guest_id_idx" ON "polls" USING HASH ("guest_id");

-- CreateIndex
CREATE INDEX "polls_space_id_idx" ON "polls" USING HASH ("space_id");

-- CreateIndex
CREATE INDEX "polls_user_id_idx" ON "polls" USING HASH ("user_id");

-- CreateIndex
CREATE INDEX "scheduled_events_space_id_idx" ON "scheduled_events" USING HASH ("space_id");

-- CreateIndex
CREATE INDEX "scheduled_events_user_id_idx" ON "scheduled_events" USING HASH ("user_id");

-- CreateIndex
CREATE INDEX "spaces_owner_id_idx" ON "spaces" USING HASH ("owner_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING HASH ("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_space_id_idx" ON "subscriptions" USING HASH ("space_id");



-- Migration 82: 20250616140319_create_space_members
-- CreateEnum
CREATE TYPE "SpaceMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "space_members" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "SpaceMemberRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "space_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "space_members_space_id_idx" ON "space_members"("space_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_members_space_id_user_id_key" ON "space_members"("space_id", "user_id");

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 83: 20250616140359_space_members_migration
-- Create space members with OWNER role for existing spaces
INSERT INTO "space_members" ("id", "space_id", "user_id", "created_at", "updated_at", "role")
SELECT 
  gen_random_uuid(),
  id as space_id, 
  owner_id as user_id, 
  NOW() as created_at, 
  NOW() as updated_at, 
  'OWNER' as role
FROM "spaces"
WHERE NOT EXISTS (
  SELECT 1 FROM "space_members" 
  WHERE "space_members"."space_id" = "spaces"."id" 
  AND "space_members"."user_id" = "spaces"."owner_id"
);


-- Migration 84: 20250710102819_add_active_space_to_user
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "active_space_id" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_active_space_id_fkey" FOREIGN KEY ("active_space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Set active_space_id to each user's default space (where they are the owner)
UPDATE "users" u
SET "active_space_id" = (
  SELECT s.id 
  FROM "spaces" s 
  WHERE s."owner_id" = u.id 
  LIMIT 1
);



-- Migration 85: 20250711140850_add_time_zone_column
-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "time_zone" TEXT;



-- Migration 86: 20250715153525_update_space_member_indexes
-- DropIndex
DROP INDEX "space_members_space_id_idx";

-- CreateIndex
CREATE INDEX "space_members_space_id_idx" ON "space_members" USING HASH ("space_id");

-- CreateIndex
CREATE INDEX "space_members_user_id_idx" ON "space_members" USING HASH ("user_id");



-- Migration 87: 20250722083454_remove_owner_role
/*
  Warnings:

  - The values [OWNER] on the enum `SpaceMemberRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
UPDATE "space_members" SET "role" = 'ADMIN' WHERE "role" = 'OWNER';
CREATE TYPE "SpaceMemberRole_new" AS ENUM ('ADMIN', 'MEMBER');
ALTER TABLE "space_members" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "space_members" ALTER COLUMN "role" TYPE "SpaceMemberRole_new" USING ("role"::text::"SpaceMemberRole_new");
ALTER TYPE "SpaceMemberRole" RENAME TO "SpaceMemberRole_old";
ALTER TYPE "SpaceMemberRole_new" RENAME TO "SpaceMemberRole";
DROP TYPE "SpaceMemberRole_old";
ALTER TABLE "space_members" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;



-- Migration 88: 20250723192600_add_space_member_invite
-- CreateTable
CREATE TABLE "space_member_invites" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "SpaceMemberRole" NOT NULL DEFAULT 'MEMBER',
    "inviter_id" TEXT NOT NULL,

    CONSTRAINT "space_member_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "space_member_invites_space_id_idx" ON "space_member_invites" USING HASH ("space_id");

-- CreateIndex
CREATE UNIQUE INDEX "space_member_invites_space_id_email_key" ON "space_member_invites"("space_id", "email");

-- AddForeignKey
ALTER TABLE "space_member_invites" ADD CONSTRAINT "space_member_invites_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_member_invites" ADD CONSTRAINT "space_member_invites_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 89: 20250724140012_add_subscription_columns
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "subscription_item_id" TEXT;



-- Migration 90: 20250729143210_add_space_member_last_selected_at
-- AlterTable
ALTER TABLE "space_members" ADD COLUMN     "last_selected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;



-- Migration 91: 20250729144904_drop_user_active_space_id
/*
  Warnings:

  - You are about to drop the column `active_space_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_active_space_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "active_space_id";



-- Migration 92: 20250730115902_subscription_item_id_non_nullable
/*
  Warnings:

  - Made the column `subscription_item_id` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "subscription_item_id" SET NOT NULL;



-- Migration 93: 20250731100421_update_subscription_interval_enum
/*
  Warnings:

  - The values [day,week] on the enum `subscription_interval` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "subscription_interval_new" AS ENUM ('month', 'year');
ALTER TABLE "subscriptions" ALTER COLUMN "interval" TYPE "subscription_interval_new" USING ("interval"::text::"subscription_interval_new");
ALTER TYPE "subscription_interval" RENAME TO "subscription_interval_old";
ALTER TYPE "subscription_interval_new" RENAME TO "subscription_interval";
DROP TYPE "subscription_interval_old";
COMMIT;



-- Migration 94: 20250804130713_add_space_image_column
-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "image" TEXT;



-- Migration 95: 20250804152225_allow_user_multiple_subscriptions
-- DropIndex
DROP INDEX "subscriptions_user_id_key";



-- Migration 96: 20250901121851_add_ics_columns
-- Step 1: Add sequence column and optional uid column
ALTER TABLE "scheduled_events" ADD COLUMN "sequence" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "scheduled_events" ADD COLUMN "uid" TEXT;

-- Step 2: Populate uid column for existing rows
UPDATE "scheduled_events" SET "uid" = "id" || '@rallly.co' WHERE "uid" IS NULL;

-- Step 3: Make uid column non-nullable and add unique constraint
ALTER TABLE "scheduled_events" ALTER COLUMN "uid" SET NOT NULL;
CREATE UNIQUE INDEX "scheduled_events_uid_key" ON "scheduled_events"("uid");



-- Migration 97: 20251007051830_add_integration_models
-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('OAUTH');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "default_destination_calendar_id" TEXT;

-- CreateTable
CREATE TABLE "credentials" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "type" "CredentialType" NOT NULL,
    "secret" TEXT NOT NULL,
    "scopes" TEXT[],
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "credential_id" TEXT NOT NULL,

    CONSTRAINT "calendar_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_calendars" (
    "id" TEXT NOT NULL,
    "calendar_connection_id" TEXT NOT NULL,
    "provider_calendar_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "time_zone" TEXT,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "writable" BOOLEAN NOT NULL DEFAULT false,
    "provider_data" JSONB,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credential_expiry_idx" ON "credentials"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "credentials_user_id_provider_provider_account_id_key" ON "credentials"("user_id", "provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_connections_user_id_provider_provider_account_id_key" ON "calendar_connections"("user_id", "provider", "provider_account_id");

-- CreateIndex
CREATE INDEX "connection_selected_idx" ON "provider_calendars"("calendar_connection_id", "selected");

-- CreateIndex
CREATE INDEX "primary_calendar_idx" ON "provider_calendars"("primary");

-- CreateIndex
CREATE INDEX "sync_time_idx" ON "provider_calendars"("last_synced_at");

-- CreateIndex
CREATE UNIQUE INDEX "provider_calendars_calendar_connection_id_provider_calendar_key" ON "provider_calendars"("calendar_connection_id", "provider_calendar_id");

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_connections" ADD CONSTRAINT "calendar_connections_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_connections" ADD CONSTRAINT "calendar_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_calendars" ADD CONSTRAINT "provider_calendars_calendar_connection_id_fkey" FOREIGN KEY ("calendar_connection_id") REFERENCES "calendar_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_default_destination_calendar_id_fkey" FOREIGN KEY ("default_destination_calendar_id") REFERENCES "provider_calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- Migration 98: 20251014054941_better_auth
/*
  Warnings:

  - You are about to drop the column `session_state` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `token_type` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `accounts` table. All the data in the column will be lost.
  - The `email_verified` column on the `users` table is being converted from TIMESTAMP to BOOLEAN. Existing verification status is preserved.
  - Added the required column `updated_at` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "session_state",
DROP COLUMN "token_type",
DROP COLUMN "type",
ADD COLUMN     "access_token_expires_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "refresh_token_expires_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- Update existing accounts with updated_at
UPDATE "accounts" SET "updated_at" = "created_at"
WHERE "updated_at" IS NULL;

-- Make updated_at not nullable
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable - Preserve existing email verification status
-- First add the new boolean column
ALTER TABLE "users" ADD COLUMN "email_verified_boolean" BOOLEAN;

-- Convert existing DateTime values to BOOLEAN (NULL stays NULL, any timestamp becomes TRUE)
UPDATE "users" SET "email_verified_boolean" = CASE 
  WHEN "email_verified" IS NOT NULL THEN TRUE 
  ELSE NULL 
END;

-- Drop the old column and rename the new one
ALTER TABLE "users" DROP COLUMN "email_verified";
ALTER TABLE "users" RENAME COLUMN "email_verified_boolean" TO "email_verified";

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 99: 20251021132911_add_better_auth_admin_fields
-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "impersonated_by" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ban_expires" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_impersonated_by_fkey" FOREIGN KEY ("impersonated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;



-- Migration 100: 20251021160519_add_last_login_method
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_login_method" TEXT;



-- Migration 101: 20251027170830_anonymous_user
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "anonymous" BOOLEAN NOT NULL DEFAULT false;



-- Migration 102: 20251107120000_allow_multiple_space_subscriptions
-- DropIndex
DROP INDEX IF EXISTS "subscriptions_space_id_key";




-- Migration 103: 20251107131500_add_space_tier
-- CreateEnum
CREATE TYPE "space_tiers" AS ENUM ('hobby', 'pro');

-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "tier" "space_tiers" NOT NULL DEFAULT 'hobby';

-- Populate new column based on active subscriptions
UPDATE "spaces"
SET "tier" = 'pro'
WHERE EXISTS (
  SELECT 1
  FROM "subscriptions"
  WHERE "subscriptions"."space_id" = "spaces"."id"
    AND "subscriptions"."active" = true
);




-- Migration 104: 20251110113931_non_nullable_space_id_susbcription
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_space_id_fkey";

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "space_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Migration 105: 20251202151504_better_auth_joins
/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `verifications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verifications_identifier_key" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");


