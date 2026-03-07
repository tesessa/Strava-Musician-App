/**
 * Shared types and utilities for Strava Musician App.
 * DTOs and enums are in ./dto (schema- and API-aligned).
 */

export * from "./dto";

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

// Default app config
export const APP_CONFIG: AppConfig = {
  appName: "Koda",
  version: "1.0.0",
};
