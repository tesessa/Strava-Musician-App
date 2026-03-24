import { APP_CONFIG } from "@strava-musician-app/shared";

export default function Home() {
  const routes = [
    // --- Health ---
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
        "{ email: string, username: string, password: string, visibility: 'public' | 'private' | 'friends', imageUrl?: string, bio?: string, instruments?: string[]}",
      responseBody: "{ token: string, expiresAt: number, user: User } (201) or { error } (4xx/409)",
      exampleCurl: `curl -i -X POST http://localhost:3001/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alice@example.com","username":"alice","password":"secret","visibility":"public"}'`,
    },
    {
      path: "/auth/login",
      method: "POST",
      purpose: "Authenticate and receive an auth token + full user profile",
      requestBody: "{ email: string, password: string }",
      responseBody: "{ authToken: { token: string, expiresAt: number }, user: User } (200) or { error } (401/400)",
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
      purpose: "Get a user's profile by ID. (Does not require ou to be the user)",
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
    {
      path: "/users/:userId/practice-logs",
      method: "GET",
      purpose: "List visible practice logs for a user (paginated, keyset). Returns logs if you are the user, a friend (and not private), or if the user's logs are public.",
      requestBody: "none (must send Authorization header, use query params: lastItemId?, pageSize?)",
      responseBody: "{ practiceLogs: PracticeLog[] } (200) or { error } (403/401/404)",
      exampleCurl: `curl -X GET "http://localhost:3001/users/<userId>/practice-logs?pageSize=5" \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    // --- Practice Log Routes ---
    {
      path: "/practice-logs",
      method: "POST",
      purpose: "Create a new practice log",
      requestBody:
        "{ title: string, durationMinutes: number, visibility: 'public' | 'private' | 'friends', postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string } (must send Authorization header)",
      responseBody: "{ practiceLog: PracticeLog } (201) or { error } (400/401)",
      exampleCurl: `curl -X POST http://localhost:3001/practice-logs \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -d '{"title":"Practice Piano","durationMinutes":60,"visibility":"public"}'`,
    },
    {
      path: "/practice-logs/feed",
      method: "GET",
      purpose: "Get a paginated feed of practice logs created by the authenticated user and their friends. Returns logs in reverse chronological order.",
      requestBody: "none (must send Authorization header, use query params: lastItemId?, pageSize?)",
      responseBody: "{ practiceLogs: PracticeLog[] } (200) or { error } (400/401)",
      exampleCurl: `curl -X GET "http://localhost:3001/practice-logs/feed?lastItemId=<last_id>&pageSize=5" \\\n-H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/practice-logs/:practiceLogId",
      method: "GET",
      purpose: "Get a specific practice log by ID",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ practiceLog: PracticeLog } (200) or { error } (404/401)",
      exampleCurl: `curl -X GET http://localhost:3001/practice-logs/<practiceLogId> \\
  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/practice-logs/:practiceLogId",
      method: "PATCH",
      purpose: "Update a practice log by ID",
      requestBody:
        "{ title?: string, durationMinutes?: number, visibility?: 'public' | 'private' | 'friends', postText?: string, privateText?: string, instrument?: string, tempo?: number, pieceTitle?: string, composer?: string } (must send Authorization header)",
      responseBody: "{ practiceLog: PracticeLog } (200) or { error } (404/401)",
      exampleCurl: `curl -X PATCH http://localhost:3001/practice-logs/<practiceLogId> \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -d '{"postText":"Updated notes"}'`,
    },
    {
      path: "/practice-logs/:practiceLogId",
      method: "DELETE",
      purpose: "Delete a practice log by ID",
      requestBody: "none (must send Authorization header)",
      responseBody: "204 No Content on success, or { error } (404/401)",
      exampleCurl: `curl -X DELETE http://localhost:3001/practice-logs/<practiceLogId> \\
  -H "Authorization: Bearer <TOKEN>"`,
    },
    // --- Media Routes ---
    {
      path: "/practice-logs/:practiceLogId/media",
      method: "POST",
      purpose: "Add media to a practice log (must be the owner)",
      requestBody: "{ type: 'image' | 'audio' | 'video', url: string } (must send Authorization header)",
      responseBody: "{ media: Media } (201) or { error } (400/401/403/404)",
      exampleCurl: `curl -X POST http://localhost:3001/practice-logs/<practiceLogId>/media \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Authorization: Bearer <TOKEN>\" \\\n  -d '{"type":"image","url":"http://example.com/img.png"}'`,
    },
    {
      path: "/practice-logs/:practiceLogId/media",
      method: "GET",
      purpose: "List media for a practice log (must have access to the log)",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ media: Media[] } (200) or { error } (401/403/404)",
      exampleCurl: `curl -X GET http://localhost:3001/practice-logs/<practiceLogId>/media \\\n  -H \"Authorization: Bearer <TOKEN>\"`,
    },
    {
      path: "/media/:mediaId",
      method: "DELETE",
      purpose: "Delete a media item (must be the owner)",
      requestBody: "none (must send Authorization header)",
      responseBody: "204 No Content on success, or { error } (401/403/404)",
      exampleCurl: `curl -X DELETE http://localhost:3001/media/<mediaId> \\\n  -H \"Authorization: Bearer <TOKEN>\"`,
    },
    // --- Likes Routes ---
    {
      path: "/practice-logs/:practiceLogId/likes",
      method: "POST",
      purpose: "Like a practice log (must have access to the log)",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ success: true } (201) or { error } (400/401/403/404)",
      exampleCurl: `curl -X POST http://localhost:3001/practice-logs/<practiceLogId>/likes \\\n  -H \"Authorization: Bearer <TOKEN>\"`,
    },
    {
      path: "/practice-logs/:practiceLogId/likes",
      method: "DELETE",
      purpose: "Unlike a practice log (must have previously liked it)",
      requestBody: "none (must send Authorization header)",
      responseBody: "204 No Content on success, or { error } (401/403/404)",
      exampleCurl: `curl -X DELETE http://localhost:3001/practice-logs/<practiceLogId>/likes \\\n  -H \"Authorization: Bearer <TOKEN>\"`,
    },
    {
      path: "/practice-logs/:practiceLogId/likes",
      method: "GET",
      purpose: "List users who liked the practice log (must have access to the log)",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ likes: Like[] } (200) or { error } (401/403/404)",
      exampleCurl: `curl -X GET http://localhost:3001/practice-logs/<practiceLogId>/likes \\\n  -H \"Authorization: Bearer <TOKEN>\"`,
    },
        // --- Comments Routes ---
    {
      path: "/practice-logs/:practiceLogId/comments",
      method: "POST",
      purpose: "Add a comment to a practice log (must have access)",
      requestBody: "{ text: string } (must send Authorization header)",
      responseBody: "{ comment: Comment } (201) or { error } (400/401/403/404)",
      exampleCurl: `curl -X POST http://localhost:3001/practice-logs/<practiceLogId>/comments \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Authorization: Bearer <TOKEN>\" \\\n  -d '{\"text\":\"Nice practice!\"}'`,
    },
    {
      path: "/practice-logs/:practiceLogId/comments",
      method: "GET",
      purpose: "List comments for a practice log (must have access)",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ comments: Comment[] } (200) or { error } (401/403/404)",
      exampleCurl: `curl -X GET http://localhost:3001/practice-logs/<practiceLogId>/comments \\\n  -H \"Authorization: Bearer <TOKEN>\"`,
    },
    {
      path: "/comments/:commentId",
      method: "DELETE",
      purpose: "Delete a comment (must be the comment's author)",
      requestBody: "none (must send Authorization header)",
      responseBody: "204 No Content on success, or { error } (401/403/404)",
      exampleCurl: `curl -X DELETE http://localhost:3001/comments/<commentId> \\\n  -H \"Authorization: Bearer <TOKEN>\"`,
    },
     // --- Friends and Friend Requests Routes ---
    {
      path: "/friends",
      method: "GET",
      purpose: "List your friends (paginated)",
      requestBody: "none (must send Authorization header, use query params: lastFriendId?, pageSize?)",
      responseBody: "Friend[] (200) or { error } (401)",
      exampleCurl: `curl -X GET "http://localhost:3001/friends?pageSize=2&lastFriendId=<last_id>" \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/friends/:friendId",
      method: "POST",
      purpose: "Send or accept a friend request",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ requestId, status } or { error }",
      exampleCurl: `curl -X POST http://localhost:3001/friends/<friendId> \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/friends/:friendId",
      method: "DELETE",
      purpose: "Remove a friend",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ success: true } (200) or { error } (403/401)",
      exampleCurl: `curl -X DELETE http://localhost:3001/friends/<friendId> \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/friends/is-friend/:userId",
      method: "GET",
      purpose: "Check if you are friends with a user",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ isFriend: boolean } (200) or { error } (401)",
      exampleCurl: `curl -X GET http://localhost:3001/friends/is-friend/<userId> \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/friend-requests/:userId",
      method: "POST",
      purpose: "Send a friend request to a user",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ requestId, status } or { error }",
      exampleCurl: `curl -X POST http://localhost:3001/friend-requests/<userId> \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/friend-requests/incoming",
      method: "GET",
      purpose: "List incoming friend requests (paginated)",
      requestBody: "none (must send Authorization header, use query params: lastRequestId?, pageSize?)",
      responseBody: "FriendRequest[] (200) or { error } (401)",
      exampleCurl: `curl -X GET "http://localhost:3001/friend-requests/incoming?pageSize=2&lastRequestId=<last_id>" \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/friend-requests/outgoing",
      method: "GET",
      purpose: "List outgoing friend requests (paginated)",
      requestBody: "none (must send Authorization header, use query params: lastRequestId?, pageSize?)",
      responseBody: "FriendRequest[] (200) or { error } (401)",
      exampleCurl: `curl -X GET "http://localhost:3001/friend-requests/outgoing?pageSize=2&lastRequestId=<last_id>" \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/friend-requests/:requestId/accept",
      method: "POST",
      purpose: "Accept a friend request",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ success: true } (200) or { error } (404/403/401)",
      exampleCurl: `curl -X POST http://localhost:3001/friend-requests/<requestId>/accept \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/friend-requests/:requestId/reject",
      method: "POST",
      purpose: "Reject a friend request",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ success: true } (200) or { error } (404/403/401)",
      exampleCurl: `curl -X POST http://localhost:3001/friend-requests/<requestId>/reject \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    {
      path: "/friend-requests/:requestId",
      method: "DELETE",
      purpose: "Cancel a sent friend request",
      requestBody: "none (must send Authorization header)",
      responseBody: "{ success: true } (200) or { error } (404/403/401)",
      exampleCurl: `curl -X DELETE http://localhost:3001/friend-requests/<requestId> \\\n  -H "Authorization: Bearer <TOKEN>"`,
    },
    
  ];

  // Group routes by section
  const groupedRoutes = [
    {
      title: "Authentication",
      routes: routes.filter(r => r.path.startsWith("/auth")),
    },
    {
      title: "User Management",
      routes: routes.filter(r => r.path.startsWith("/users")),
    },
    {
      title: "Practice Logs",
      routes: routes.filter(r =>
        r.path.startsWith("/practice-logs") &&
        !r.path.includes("/media") &&
        !r.path.includes("/likes") &&
        !r.path.includes("/comments")
      ),
    },
    {
      title: "Media",
      routes: routes.filter(r =>
        r.path.includes("/media") || r.path.startsWith("/media")
      ),
    },
    {
      title: "Likes",
      routes: routes.filter(r =>
        r.path.includes("/likes") || r.path.startsWith("/likes")
      ),
    },
    {
      title: "Comments",
      routes: routes.filter(r =>
        r.path.includes("/comments") || r.path.startsWith("/comments")
      ),
    },
    {
      title: "Friends & Friend Requests",
      routes: routes.filter(r => r.path.startsWith("/friends") || r.path.startsWith("/friend-requests")),
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

        {groupedRoutes.map((group) => (
          <div key={group.title} style={{ marginTop: 56, marginBottom: 56 }}>
            <h2 style={{ fontSize: 3.2 + 'rem', fontWeight: 800, marginBottom: 24, marginTop: 0, letterSpacing: '-1px' }}>{group.title}</h2>
            {group.routes.map((r) => (
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