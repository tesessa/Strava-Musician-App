import { APP_CONFIG } from "@strava-musician-app/shared";
import type { PracticeSession } from "@strava-musician-app/shared";

export default function Home() {
  const exampleSession: PracticeSession = {
    id: "1",
    userId: "user-1",
    instrument: "Piano",
    durationMinutes: 30,
    notes: "Practiced scales and a new piece",
    createdAt: new Date(),
  };

  const routes = [
    {
      path: "/api/health",
      method: "GET",
      purpose: "Backend health check",
      requestBody: "none",
      responseBody: "{ status: 'ok', timestamp: string }",
      exampleCurl: `curl -i http://localhost:3001/api/health`,
    },
    {
      path: "/api/auth/register",
      method: "POST",
      purpose: "Create a new user account",
      requestBody:
        "{ email: string, username: string, password: string, displayName?: string, imageUrl?: string, bio?: string, instruments?: string[]}",
      responseBody: "{ token: string, expiresAt: number, user: User } (201) or { error } (4xx/409)",
      exampleCurl: `curl -i -X POST http://localhost:3001/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alice@example.com","username":"alice","password":"secret","displayName":"Alice"}'`,
    },
    {
      path: "/api/auth/login",
      method: "POST",
      purpose: "Authenticate and receive an auth token + full user profile",
      requestBody: "{ email: string, password: string }",
      responseBody: "{ token: string, expiresAt: number, user: User } (200) or { error } (401/400)",
      exampleCurl: `curl -i -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alice@example.com","password":"secret"}'`,
    },
    {
      path: "/api/auth/logout",
      method: "POST",
      purpose: "Revoke the current session token",
      requestBody: "none (must send Authorization header)",
      responseBody: "204 No Content on success, or { error } (401) on failure",
      exampleCurl: `curl -i -X POST http://localhost:3001/api/auth/logout \\
  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/api/auth/me",
      method: "GET",
      purpose: "Return the authenticated user's profile",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ user: User } (200) or { error } (401)",
      exampleCurl: `curl -i http://localhost:3001/api/auth/me -H "Authorization: Bearer <TOKEN>"`,
    },
    // {
    //   path: "/api/sessions",
    //   method: "POST",
    //   purpose: "Create a practice session",
    //   requestBody:
    //     "{ title?, postText?, privateText?, instrument?, duration, tempo?, pieceTitle?, composer?, visibility? }",
    //   responseBody: "{ session: PracticeSession } (201) or { error }",
    // },
    // {
    //   path: "/api/sessions/feed",
    //   method: "GET or POST (page body)",
    //   purpose: "Get one page of sessions visible to the current user",
    //   requestBody: "{ lastItem?: string, pageSize?: number } (if POST) or query params for GET",
    //   responseBody: "{ sessions: PracticeSession[], lastItem?: string } (200)",
    // },
    // {
    //   path: "/api/sessions/:sessionId",
    //   method: "GET | PATCH | DELETE",
    //   purpose: "Fetch, update, or delete a specific session",
    //   requestBody:
    //     "GET: none; PATCH: partial session fields; DELETE: none (Authorization required for protected ops)",
    //   responseBody: "GET: { session }; PATCH: { session }; DELETE: 204 on success",
    // },
    // {
    //   path: "/api/friends /api/friend-requests",
    //   method: "varies",
    //   purpose: "Friend list and friend-request management (see API spec)",
    //   requestBody: "varies by endpoint (mostly no body for send/accept/reject)",
    //   responseBody: "Lists or status codes; { error } on failure",
    // },
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
        <h2>Example Practice Session</h2>
        <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 6 }}>{JSON.stringify(exampleSession, null, 2)}</pre>

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