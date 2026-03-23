# Koda Key Flows and UX

Use this document for feature behavior, user journeys, frontend/backend interaction expectations, and non-functional UX guidance.

## Search

User types a query and presses Enter or clicks search -> frontend calls `GET /users/search?query=...` -> backend runs database query and returns paginated results.

## Feed (Infinite Scroll)

Frontend displays a feed skeleton (for example Suspense), calls `GET /practice-logs/feed` with body `{ lastItem, pageSize }`. Backend uses JOIN, ORDER, LIMIT with keyset pagination on `createdAt`. Returns one page at a time. InfiniteScroll component (for example invisible 1px trigger) calls reload for the next page.

## Login

User submits email + password. Frontend stores access token in memory and uses it for API calls; auto-refresh when it expires (proactive and reactive). Backend verifies password, issues a new refresh token (cookie), and returns an access token. Frontend stores access token, then redirects into the app.

## Register

User submits email, password, username, first/last name, bio, profile pic, etc. Backend validates email format, hashes password with bcrypt, stores user in DB, creates refresh token (HTTP-only cookie), returns access token (JSON).

## View Friend Profile

Frontend-only behavior; use URL/profile prop to show that user profile (subject to privacy).

## Metronome (Tool)

Frontend-only; available from anywhere. Use Tone.js as the audio scheduler. User can set BPM and time signature.

## Tuner (Tool)

Frontend-only; available from anywhere. Use "Pitchy" as the pitch-detection library with a friendly UI.

## Start a New Practice Session

1. User selects an instrument from a dropdown (from profile instruments).
2. A practice log is created in the database, a timer is started, and the user is directed to a simplified UI with only session actions.
3. User can record audio, record video, add sheet music, and use Metronome/Tuner.

## Timer (Session)

Event-based to handle reloads or connection issues. Frontend sends `startTimer` to the server; frontend shows a timer and increments every second (for example `setTimeout` 1000ms). Server runs its own timer. Frontend pings every 5-10 seconds or after reload with `syncTimer`; +/-1s buffer is acceptable; otherwise frontend adjusts to match backend. On end session, frontend sends `stopTimer`; server time is the official session length.

## Record Audio

Request microphone permission the first time. User presses Record -> audio records until stop/pause -> clip is added to the session list with playback. Frontend uploads file to object storage, then sends full Oracle object URLs to the backend to store in the DB.

## Record Video

Request camera permission the first time. User presses Record -> audio+video until stop/pause -> video added to list with playback. Frontend uploads to object storage, sends full Oracle object URLs to backend.

## Sheet Music

User can upload a PDF (or select from a list). File explorer opens; user selects file -> file is shown on frontend (for example pdfjs). If they already have uploads, they can pick from a dropdown populated by backend; selected file is fetched from object storage and displayed. New file is sent to object storage.

## End Session

Timer is stopped on the server. User sees a form to set: which audio/video clips to include/exclude, practice tempo, pieces practiced (title, composer), optional text. Post visibility is always the user profile `postVisibility` (no per-session override). Post is optimistically shown at the top of the user feed; full post data is sent to the backend. When the backend receives the new practice session, it updates challenge progress. If a challenge was completed in that session, the user should see a banner (unless a websocket is added, completed challenges may need to be part of the create post response so the frontend can show the banner).

## Comment / Like a Practice Log

Frontend calls the practice log comments and likes API endpoints.

## Events and Calendar

Calendar is for scheduling and viewing events (lessons, regular practice time, recitals/performances). Recitals/performances use the `performance` eventType (same enum as practice and lesson); show them in a different color in the UI. Event fields (`date`, `startTime`, `endTime`, `isAllDay`, `location`, `reminderMinBefore`, `visibility`, etc.) are defined in the data model doc.

## Reliability

- **Database**: Supabase provides managed PostgreSQL with high availability, backups, and point-in-time recovery.
- **Media storage**: Oracle Cloud Object Storage provides durable storage for session media.
- **Session timer**: Event-based timer with frontend-backend sync keeps session duration accurate across reloads; backend is source of truth.
- **Optimistic UI**: New practice session posts are shown immediately while the backend processes the request.
- **Token refresh**: Access tokens are refreshed proactively and reactively to keep sessions active.

## Performance

- **Feed**: Keyset pagination on `createdAt` and infinite scroll keep the feed efficient as data grows.
- **Media**: Files are uploaded from the frontend to object storage, keeping the database lean and enabling efficient delivery.
- **Hosting**: Frontend runs locally or via ngrok.
- **Architecture**: Service-layer separation allows caching and efficient data handling; Supabase supports scaling without app changes.

## Functionality

Koda supports: practice log tracking with timer, audio/video/sheet music; friends, likes, comments, and profile viewing; challenges with progress and completion notifications; event scheduling (practice, lessons, performances) on the calendar; metronome and tuner; visibility controls (public, private, friends); user search; and notifications.

## Compatibility

- **Web**: Runs in any modern browser (Chrome, Firefox, Safari, Edge) on desktop, laptop, tablet, or phone. Uses MediaRecorder API for audio/video.
- **Frontend**: Runs locally or via ngrok tunnel.
- **Database**: Supabase exposes standard PostgreSQL.
- **Media**: Audio/video in browser-friendly formats; sheet music as PDF.

## Cost

Koda runs 100% free: Supabase (database) and Oracle Cloud Object Storage (media) on free tiers; frontend runs locally or via ngrok free tier. No infrastructure or hosting cost. If usage later exceeds free tiers, the stack can move to paid tiers without changing the architecture.

## Related Docs

- Frontend architecture and UI patterns: `docs/KODA-Frontend-Architecture.md`
- Backend architecture details: `docs/KODA-Backend-Architecture.md`
- Endpoint contracts: `docs/KODA-API-Surface.md`
