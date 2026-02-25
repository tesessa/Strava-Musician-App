import { APP_CONFIG } from "@strava-musician-app/shared";
import type { PracticeSession } from "@strava-musician-app/shared";

export default function Home() {
  const routes = [
    {
      path: "/health",
      method: "GET",
      purpose: "Backend health check",
      requestBody: "none",
      responseBody: "{ status: 'ok', timestamp: string }",
      exampleCurl: `curl -i http://localhost:3001/health`,
    },
    {
      path: "/auth/register",
      method: "POST",
      purpose: "Create a new user account",
      requestBody:
        "{ email: string, username: string, password: string, displayName?: string, imageUrl?: string, bio?: string, instruments?: string[]}",
      responseBody: "{ token: string, expiresAt: number, user: User } (201) or { error } (4xx/409)",
      exampleCurl: `curl -i -X POST http://localhost:3001/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alice@example.com","username":"alice","password":"secret","displayName":"Alice"}'`,
    },
    {
      path: "/auth/login",
      method: "POST",
      purpose: "Authenticate and receive an auth token + full user profile",
      requestBody: "{ email: string, password: string }",
      responseBody: "{ token: string, expiresAt: number, user: User } (200) or { error } (401/400)",
      exampleCurl: `curl -i -X POST http://localhost:3001/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alice@example.com","password":"secret"}'`,
    },
    {
      path: "/auth/logout",
      method: "POST",
      purpose: "Revoke the current session token",
      requestBody: "none (must send Authorization header)",
      responseBody: "204 No Content on success, or { error } (401) on failure",
      exampleCurl: `curl -i -X POST http://localhost:3001/auth/logout \\
  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/auth/me",
      method: "GET",
      purpose: "Return the authenticated user's profile",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ user: User } (200) or { error } (401)",
      exampleCurl: `curl -i http://localhost:3001/auth/me -H "Authorization: Bearer <TOKEN>"`,
    },
    // --- User Routes ---
    {
      path: "/users/:userId",
      method: "GET",
      purpose: "Get a user's profile (must be the user)",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ user: User } (200) or { error } (404/401/403)",
      exampleCurl: `curl -X GET http://localhost:3001/users/<userId> \\
  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/users/:userId",
      method: "PATCH",
      purpose: "Update a user's profile (must be the user)",
      requestBody: "{ displayName?: string, imageUrl?: string, bio?: string, instruments?: string[] } (must send Authorization header)",
      responseBody: "{ user: User } (200) or { error } (404/401/403)",
      exampleCurl: `curl -X PATCH http://localhost:3001/users/<userId> \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -d '{"displayName":"Alice Updated"}'`,
    },
    {
      path: "/users/:userId",
      method: "DELETE",
      purpose: "Delete a user's account (must be the user)",
      requestBody: "none (must send Authorization header)",
      responseBody: "204 No Content on success, or { error } (404/401/403)",
      exampleCurl: `curl -X DELETE http://localhost:3001/users/<userId> \\
  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/users/search",
      method: "GET",
      purpose: "Search for users by query string",
      requestBody: "none (must send Authorization header, use query param: query)",
      responseBody: "{ users: User[] } (200) or { error } (401)",
      exampleCurl: `curl -X GET "http://localhost:3001/users/search?query=alice" \\
  -H "Authorization: Bearer <TOKEN>"`,
    },
    // --- Practice Session Routes ---
    {
      path: "/sessions",
      method: "POST",
      purpose: "Create a new practice session",
      requestBody:
        "{ title: string, durationMinutes: number, visibility: 'public' | 'private' | 'friends', postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string } (must send Authorization header)",
      responseBody: "{ session: PracticeSession } (201) or { error } (400/401)",
      exampleCurl: `curl -X POST http://localhost:3001/sessions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -d '{"title":"Practice Piano","durationMinutes":60,"visibility":"public"}'`,
    },
    {
      path: "/sessions/feed",
      method: "GET",
      purpose: "Get a paginated feed of your practice sessions",
      requestBody: "none (must send Authorization header, use query params: lastItemId?, pageSize?)",
      responseBody: "{ sessions: PracticeSession[] } (200) or { error } (400/401)",
      exampleCurl: `curl -X GET "http://localhost:3001/sessions/feed?lastItemId=<last_id>&pageSize=5" \\
-H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/sessions/:sessionId",
      method: "GET",
      purpose: "Get a specific practice session by ID",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ session: PracticeSession } (200) or { error } (404/401)",
      exampleCurl: `curl -X GET http://localhost:3001/sessions/<sessionId> \\
  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/sessions/:sessionId",
      method: "PATCH",
      purpose: "Update a practice session by ID",
      requestBody:
        "{ title?: string, durationMinutes?: number, visibility?: 'public' | 'private' | 'friends', postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string } (must send Authorization header)",
      responseBody: "{ session: PracticeSession } (200) or { error } (404/401)",
      exampleCurl: `curl -X PATCH http://localhost:3001/sessions/<sessionId> \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -d '{"postText":"Updated notes"}'`,
    },
    {
      path: "/sessions/:sessionId",
      method: "DELETE",
      purpose: "Delete a practice session by ID",
      requestBody: "none (must send Authorization header)",
      responseBody: "204 No Content on success, or { error } (404/401)",
      exampleCurl: `curl -X DELETE http://localhost:3001/sessions/<sessionId> \\
  -H "Authorization: Bearer <TOKEN>"`,
    },
  ];

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1>{APP_CONFIG.appName} — Backend API</h1>
      <p>Version: {APP_CONFIG.version}</p>

      <section style={{ marginTop: 18 }}>
        <h2>Routes & shapes</h2>
        <p style={{ color: "#444" }}>
          Below are the currently implemented routes, the expected request body (if any), and the response shape.
          Frontend developers should use programmatic HTTP calls (fetch/axios). curl examples are included as a quick CLI
          reference for manual testing or CI smoke tests.
        </p>

        {routes.map((r) => (
          <div key={r.path + r.method} style={{ marginTop: 16, padding: 12, borderRadius: 6, background: "#fafafa" }}>
            <div style={{ fontWeight: 700 }}>
              {r.method} {r.path}
            </div>
            <div style={{ marginTop: 6, color: "#333" }}>{r.purpose}</div>

            <div style={{ marginTop: 8 }}>
              <strong>Request body:</strong>
              <div style={{ color: "#555", marginTop: 4, whiteSpace: "pre-wrap" }}>{r.requestBody || "none"}</div>
            </div>

            <div style={{ marginTop: 8 }}>
              <strong>Response:</strong>
              <div style={{ color: "#555", marginTop: 4, whiteSpace: "pre-wrap" }}>{r.responseBody || "varies"}</div>
            </div>

            {r.exampleCurl ? (
              <>
                <div style={{ marginTop: 8 }}>
                  <strong>CLI (curl) example:</strong>
                </div>
                <pre style={{ background: "#f0f0f0", padding: 8, borderRadius: 4, marginTop: 6 }}>{r.exampleCurl}</pre>
              </>
            ) : null}
          </div>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>

        <ul style={{ marginTop: 12, color: "#444" }}>
          <li>Preferred examples for frontend devs: use programmatic HTTP calls (fetch/axios) from the client code.</li>
          <li>curl is useful for quick manual testing from the terminal and for CI smoke tests.</li>
          <li>Auth tokens are opaque Bearer tokens — include them in Authorization header for protected endpoints.</li>
          <li>Current backend uses an in-memory store for development; data is not persistent.</li>
        </ul>
      </section>
    </main>
  );
}