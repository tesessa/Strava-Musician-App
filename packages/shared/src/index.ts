/**
 * Shared types and utilities for Strava Musician App.
 * Schema- and API-aligned types and enums.
 */

export * from "./enums";
export * from "./sessions";
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
