/**
 * Shared types and utilities for Strava Musician App
 * Below are example types. They are not set in stone and will be updated as we go.
 */

//Prototype Auth Token
export interface AuthToken {
  token: string;
  timestamp: Date;
}
// Example User type for the application
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: Date;
  imageUrl?: string;
  bio?: string;
  instruments?: string[];
}

// Example Practice session logged by a musician
export interface PracticeSession {
  id: string;
  userId: string;
  title: string;
  durationMinutes: number;
  createdAt: Date;
  visibility: "public" | "private" | "friends";
  postText?: string;
  privateText?: string;
  instrument?: string;
  tempo?: number;
  pieceTitle?: string;
  composer?: string;
}

// Application configuration
export interface AppConfig {
  appName: string;
  version: string;
}

// Default app config
export const APP_CONFIG: AppConfig = {
  appName: "Strava Musician App",
  version: "1.0.0",
};
