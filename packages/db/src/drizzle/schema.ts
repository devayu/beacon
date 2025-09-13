import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  json,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const scanStatus = pgEnum("ScanStatus", [
  "PENDING",
  "SCANNING",
  "PROCESSING_SCREENSHOTS",
  "SCAN_COMPLETE",
  "AI_QUEUED",
  "AI_PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const violationImpact = pgEnum("ViolationImpact", [
  "MINOR",
  "MODERATE",
  "SERIOUS",
  "CRITICAL",
]);

export const priorityLevel = pgEnum("PriorityLevel", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const plan = pgEnum("Plan", ["FREE", "PREMIUM"]);

// Tables
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const routes = pgTable("route", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  url: text("url").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const scanJobs = pgTable("scan_job", {
  id: text("id").primaryKey(),
  routeId: text("routeId")
    .notNull()
    .references(() => routes.id),
  status: scanStatus("status").default("PENDING").notNull(),
  result: json("result"),
  priority: json("priority"),
  transformedResult: json("transformedResult"),
  userId: text("userId"),
  screenshotUrl: text("screenshotUrl"),
  violationsScreenshotUrl: text("violationsScreenshotUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  error: text("error"),
});

export const accessibilityViolations = pgTable("accessibility_violation", {
  id: text("id").primaryKey(),
  scanJobId: text("scanJobId")
    .notNull()
    .references(() => scanJobs.id, { onDelete: "cascade" }),
  ruleId: text("ruleId").notNull(),
  impact: violationImpact("impact").notNull(),
  description: text("description").notNull(),
  help: text("help").notNull(),
  helpUrl: text("helpUrl").notNull(),
  priority: priorityLevel("priority").notNull(),
  nodes: json("nodes").$type<any[]>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  priorityScore: integer("priorityScore").notNull(),
});

export const explanations = pgTable("explanation", {
  id: text("id").primaryKey(),
  issueCode: text("issueCode").notNull().unique(),
  explanation: text("explanation").notNull(),
  detailedExplanation: text("detailedExplanation").notNull(),
  recommendation: text("recommendation").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  routes: many(routes),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const routesRelations = relations(routes, ({ one, many }) => ({
  user: one(users, {
    fields: [routes.userId],
    references: [users.id],
  }),
  scanJobs: many(scanJobs),
}));

export const scanJobsRelations = relations(scanJobs, ({ one, many }) => ({
  route: one(routes, {
    fields: [scanJobs.routeId],
    references: [routes.id],
  }),
  violations: many(accessibilityViolations),
}));

export const accessibilityViolationsRelations = relations(
  accessibilityViolations,
  ({ one }) => ({
    scanJob: one(scanJobs, {
      fields: [accessibilityViolations.scanJobId],
      references: [scanJobs.id],
    }),
  })
);

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;

export type ScanJob = typeof scanJobs.$inferSelect;
export type NewScanJob = typeof scanJobs.$inferInsert;

export type AccessibilityViolation =
  typeof accessibilityViolations.$inferSelect;
export type NewAccessibilityViolation =
  typeof accessibilityViolations.$inferInsert;

export type Explanation = typeof explanations.$inferSelect;
export type NewExplanation = typeof explanations.$inferInsert;
