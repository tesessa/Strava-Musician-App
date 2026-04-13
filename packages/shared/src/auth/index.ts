import type { User } from "../users";

/**
 * POST /auth/register body.
 * New users are created with postVisibility "friends" by default (not in request).
 */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

/**
 * POST /auth/login body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response from login (and optionally register). Access token in JSON.
 * Refresh token in HTTP-only cookie is not part of DTOs.
 */
export interface AuthResponse {
  token: string;
  user?: User;
}

/**
 * Token with expiry timestamp (e.g. backend session). Use AuthResponse for minimal shape.
 */
export interface AuthToken {
  token: string;
  timestamp: Date;
}

/**
 * GET /auth/me — response body is the authenticated `User` (no password).
 */
export type MeResponse = User;
