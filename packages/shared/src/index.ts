/**
 * Shared types and utilities for Strava Musician App.
 * Schema- and API-aligned types and enums.
 */

export * from "./enums";
export * from "./practiceLogs";
export * from "./users";
export * from "./auth";
export * from "./friends";
export * from "./friend-requests";
export * from "./media";
export * from "./likes";
export * from "./comments";
export * from "./challenges";
export * from "./notifications";
export * from "./events";
export * from "./optional";

// Feed display model for a practice log
export interface FeedPracticeLog {
  practiceLogId: string;
  userId?: string;
  name: string;
  title: string;
  details: string;
  instrument: string;
  createdAt: Date;
  likeCount?: number;
  likedByMe?: boolean;
  commentCount?: number;
  comments?: FeedComment[];
}

// Example comment for practice logs
export interface FeedComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: Date;
}

// Application configuration
export interface AppConfig {
  appName: string;
  version: string;
}

// Default app config
export const APP_CONFIG: AppConfig = {
  appName: "Koda",
  version: "1.0.0",
};
