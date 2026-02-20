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
  imageUrl: string;
  bio?: string;
  instruments?: string[];
}

// Example Practice session logged by a musician
export interface PracticeSession {
  id: string;
  userId: string;
  instrument: string;
  durationMinutes: number;
  notes?: string;
  createdAt: Date;
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
