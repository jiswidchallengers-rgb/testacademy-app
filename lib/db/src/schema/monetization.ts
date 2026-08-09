import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { studentsTable } from "./students";

/**
 * Monetization additions (coins, premium, payments, referrals).
 *
 * These tables are ADDITIVE. They do not modify or replace any existing
 * table. All coin / premium / payment / reward mutations are performed
 * server-side only.
 */

// One wallet row per student. Holds coins + premium window + referral code.
export const studentWalletsTable = pgTable("student_wallets", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .unique()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  // Coins are never allowed to go negative (enforced server-side).
  coins: integer("coins").notNull().default(0),
  // The one-time 100 coin welcome grant flag. Ensures it can only happen once.
  initialGranted: boolean("initial_granted").notNull().default(false),
  // Premium window (null when the student has never had premium).
  premiumStartsAt: timestamp("premium_starts_at", { withTimezone: true }),
  premiumExpiresAt: timestamp("premium_expires_at", { withTimezone: true }),
  // Referral code owned by this student (shared with others).
  referralCode: text("referral_code").notNull().unique(),
  // Who referred this student (set at most once).
  referredByStudentId: integer("referred_by_student_id").references(
    () => studentsTable.id,
    { onDelete: "set null" },
  ),
  // Whether this student has already used/claimed a referral code.
  referralClaimed: boolean("referral_claimed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type StudentWallet = typeof studentWalletsTable.$inferSelect;

// Cumulative wrong-answer tracking per (student, level).
export const mcqLevelProgressTable = pgTable(
  "mcq_level_progress",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    levelId: integer("level_id").notNull(),
    // Total wrong answers accumulated in this level across attempts.
    wrongCount: integer("wrong_count").notNull().default(0),
    // How many completed "groups of 3 wrong answers" have already been charged.
    groupsCharged: integer("groups_charged").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    studentLevelUnique: uniqueIndex("mcq_level_progress_student_level_uq").on(
      t.studentId,
      t.levelId,
    ),
  }),
);

export type McqLevelProgress = typeof mcqLevelProgressTable.$inferSelect;

// Idempotent record of each quiz submission (prevents double-deduction on
// refresh / duplicate submit). Also serves as MCQ attempt history.
export const mcqSubmissionsTable = pgTable(
  "mcq_submissions",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    levelId: integer("level_id").notNull(),
    // Client-provided idempotency key unique per genuine attempt.
    attemptKey: text("attempt_key").notNull(),
    score: integer("score").notNull().default(0),
    total: integer("total").notNull().default(0),
    wrongInAttempt: integer("wrong_in_attempt").notNull().default(0),
    coinsDeducted: integer("coins_deducted").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    studentAttemptUnique: uniqueIndex("mcq_submissions_student_attempt_uq").on(
      t.studentId,
      t.attemptKey,
    ),
  }),
);

export type McqSubmission = typeof mcqSubmissionsTable.$inferSelect;

// Package identifiers.
export const PACKAGE_COINS_300 = "coins_300";
export const PACKAGE_PREMIUM_WEEKLY = "premium_weekly";
export const PACKAGE_PREMIUM_MONTHLY = "premium_monthly";

// Manual payment requests + full history (all statuses retained).
export const paymentRequestsTable = pgTable("payment_requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => studentsTable.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  // Amount in PKR the student claims to have paid.
  amount: integer("amount").notNull(),
  // Package the student REQUESTED (advisory only — admin has final control).
  requestedPackage: text("requested_package").notNull(),
  // Blob pathname of the uploaded payment screenshot (private store).
  screenshotPathname: text("screenshot_pathname").notNull(),
  // pending | approved | rejected
  status: text("status").notNull().default("pending"),
  // Package the admin actually awarded on approval.
  awardedPackage: text("awarded_package"),
  adminNote: text("admin_note"),
  // Identifier (email) of the admin who approved/rejected.
  decidedByAdmin: text("decided_by_admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

export type PaymentRequest = typeof paymentRequestsTable.$inferSelect;

// Each verified referral. referredStudentId is globally unique so a given
// student can only ever be counted as a referral once.
export const referralEventsTable = pgTable(
  "referral_events",
  {
    id: serial("id").primaryKey(),
    referrerStudentId: integer("referrer_student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    referredStudentId: integer("referred_student_id")
      .notNull()
      .unique()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    // Week bucket (YYYY-MM-DD of the week's Monday) this referral counted toward.
    weekStart: text("week_start").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export type ReferralEvent = typeof referralEventsTable.$inferSelect;

// Weekly share counter + reward status per student.
export const referralWeeksTable = pgTable(
  "referral_weeks",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    weekStart: text("week_start").notNull(),
    shareCount: integer("share_count").notNull().default(0),
    rewardGranted: boolean("reward_granted").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    studentWeekUnique: uniqueIndex("referral_weeks_student_week_uq").on(
      t.studentId,
      t.weekStart,
    ),
  }),
);

export type ReferralWeek = typeof referralWeeksTable.$inferSelect;
