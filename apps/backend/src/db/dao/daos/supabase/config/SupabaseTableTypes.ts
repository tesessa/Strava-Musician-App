/** User table: id is UUID (string) per architecture. */
export interface User {
  id: string;
  created_at: Date;
  updated_at: Date;
  email: string;
  username: string;
  password: string;
  image_url: string;
  bio: string;
  post_visibility: "public" | "private" | "friends";
  instruments: string[];
}

/** AuthSession table: user_id is UUID (string), FK to User.id. */
export interface AuthSession {
  auth_session_id: number;
  user_id: string;
  token: string;
  expires_at: Date;
}

export interface PracticeLog {
  userId: string;
  practiceLogId: string;
  title: string;
  postText?: string;
  privateText?: string;
  instrument?: string;
  createdAt: Date;
  durationMinutes: number;
  tempo?: number;
  pieceTitle?: string;
  composer?: string;
}
