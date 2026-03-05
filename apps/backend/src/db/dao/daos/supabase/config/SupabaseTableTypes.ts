export interface User {
  id: string;
  created_at: Date;
  email: string;
  username: string;
  password: string;
  image_url: string;
  bio: string;
  post_visibility: "public" | "private" | "friends";
  instruments: string[];
}

export interface AuthSession {
  auth_session_id: number;
  user_id: string;
  token: string;
  expires_at: Date;
}
