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
  sessionId: string;
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

// export interface PracticeSession {
//   id: string;
//   userId: string;
//   instrument: string;
//   durationMinutes: number;
//   notes?: string;
//   createdAt: Date;
// }

// Example post for feed
export interface FeedPost {
  id: string;
  userId?: string;
  name: string;
  title: string;
  details: string;
  instrument: Instrument;
  createdAt: Date;
  likeCount?: number;
  likedByMe?: boolean;
  commentCount?: number;
  comments?: FeedComment[];
}

// Example comment for posts
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

/**
 * Canonical list of instruments shared between frontend and backend.
 * Import from @strava-musician-app/shared.
 */
export const INSTRUMENTS = [
  "Piano",
  "Violin",
  "Viola",
  "Cello",
  "Double Bass",
  "Acoustic Guitar",
  "Electric Guitar",
  "Bass Guitar",
  "Ukulele",
  "Flute",
  "Clarinet",
  "Oboe",
  "Bassoon",
  "Saxophone",
  "Trumpet",
  "Trombone",
  "French Horn",
  "Tuba",
  "Drums",
  "Percussion",
  "Harp",
  "Banjo",
  "Mandolin",
  "Accordion",
  "Singing",
  "Other",
] as const;

export type Instrument = (typeof INSTRUMENTS)[number];

export type PostVisibility = "public" | "private" | "friends";

// Default app config
export const APP_CONFIG: AppConfig = {
  appName: "Koda",
  version: "1.0.0",
};
