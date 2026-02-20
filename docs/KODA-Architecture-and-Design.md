# Koda — Architecture and Design Document

*Music practice sharing app (Strava for musicians).*

---

## Overall Architecture

The system is split into **Front End** and **Back End**, with a consistent pattern for data flow.

### Frontend Pattern

All frontend components/pages should follow this pattern for getting data from the backend:

- **Components** — Handle display logic only
- **Services** — Keep business logic and data manipulation outside of main components
- **Server API layer** — See [Server API and dependency injection](#server-api-and-dependency-injection) below
- **Client Communicator** — Handles HTTP requests (used by ServerFacade)

Frontend services should look nearly identical to backend services in terms of number/name of services and function definitions/types in parallel services.

#### Server API and dependency injection

The frontend defines a single **KodaServerApi** interface implemented by:

- **ServerFacade** — Calls the actual API (uses Client Communicator for HTTP).
- **FakeDataServer** — Returns fake data for demo/development.

Which implementation is used is determined by an environment variable (e.g. demo mode ⇒ FakeDataServer). The chosen implementation is **dependency-injected into singleton instances of each service**. Services are, in turn, **dependency-injected into the components or hooks** that use them.

### Backend Pattern

All backend routes should follow this pattern for handling requests:

- **Handlers** — One handler per endpoint
- **Services** — Auth Service, User Service, P. Session Service, Event Service, Challenge Service
- **DAOs** — Auth DAO, User DAO, P. Session DAO, Event DAO, Challenge DAO

DAOs should be defined by interfaces; concrete implementations should be created using the factory pattern.

**Visibility:** Use a shared enum for visibility (and all other "this | that" types) everywhere it appears: Friend Preview, Post visibility, Challenge Visibility, Profile Photo visibility, Instrument visibility.

---

## User Interface / Application Structure

### App Router

- **Home (Feed)** — Main feed of practice session posts. Includes Header, Tools, Notifications, Search Bar; Infinite Scroll loads more items (Post[]). Use date formatters to convert Unix epoch dates from the backend into different time zones/formats.
- **Calendar** — Scheduling and viewing events (see [Events and Calendar](#events-and-calendar)).
- **Profile** — Acts as a sub-router: all `/profile/`* routes render here, with URL-parsed tabs for Practice Session, Challenges (completed and in-progress), Friends, Posts, ProfileSettings. Build the profile to be reusable: use a prop from the URL for whose profile is viewed (default: logged-in user). Only show settings for the logged-in user; other data follows the profile owner’s privacy settings. Profile/settings include: configure instruments; basic info (picture, bio, username); post visibility, default post settings, profile visibility; daily practice streak; toggle local events/concerts; view challenge progress.

### Landing

Unauthenticated users see a simple landing page that describes the app, with "Sign in" and "Sign up" buttons.

---

## Data Access and Database Layer

**Database tables:**

- **User** — userId (PK), email, username, password (encrypted), profilePhoto, bio, postVisibility, instruments[]
- **Friends** — userId (FK), friendId (FK), friendsSince; PK (userId, friendId). Store two rows per friendship: (1,2) and (2,1). Delete both when they unfriend.
- **FriendRequests** — requestId (PK), senderId (FK), receiverId (FK), status (pending | accepted | rejected | canceled), createdAt, respondedAt
- **practiceSession** — userID (FK), sessionID (PK), title, postText?, privateText?, instrument?, createdAt, visibility (public | private | friends), duration, tempo?, pieceTitle?, composer? (additional AI analysis fields may be added later)
- **Challenges** — challengeId (PK), description, task, targetNumber, instrument?
- **completedChallenges** — userId (FK), challengeId (FK), completedAt
- **Events** — eventId (PK), title, description, date, startTime, endTime, isAllDay, location, reminderMinBefore, eventType (practice | lesson | performance), visibility (public | private | friends)
- **media** — mediaId (PK), sessionId (FK), type (audio | video | sheetMusic), url, createdAt
- **Likes** — userId (FK), sessionId (FK), createdAt; PK (userId, sessionId)
- **Comments** — commentId (PK), sessionId (FK), userId (FK), text, createdAt
- **Notifications** — notificationId (PK), userId (FK), actorId (FK), type (like | comment | friendRequest | challengeCompleted), entityType (session | user | challenge), entityId, createdAt, isRead
- **authSessions** — authSessionId (PK), userId (FK), tokenHash, createdAt, expiresAt (~1hr), revokedAt

**For Challenges:** The description string should be something like "Complete 5 practice sessions"; then targetNumber = 5 and task = numPracticeSessions. Instrument is optional for instrument-specific challenges. Possible challenge tasks: numPracticeSessions, numAudioRecordings, numVideoRecordings, numFriends, numHrsPracticed (per instrument).

**Media storage:** Audio clips (and video/sheet music) are stored in Oracle Cloud Object Storage.

---

## API Surface Specification

### USERS & AUTH


| Method | Path                    | Description                                                     | Body                                                                             |
| ------ | ----------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| POST   | /auth/register          | Create a new user.                                              | { email, username, password, profilePhoto?, bio?, instruments?, postVisibility } |
| POST   | /auth/login             | Authenticate and return a token.                                | { email, password }                                                              |
| POST   | /auth/logout            | Revoke current session token (delete or mark revoked).          | none                                                                             |
| GET    | /auth/me                | Return the authenticated user's profile if token is valid.      | none                                                                             |
| GET    | /users/:userId          | Fetch a user profile.                                           | none                                                                             |
| PATCH  | /users/:userId          | Update profile fields.                                          | { username?, bio?, profilePhoto?, instruments?, postVisibility? }                |
| GET    | /users/:userId/sessions | List visible practice sessions for a user.                      | none                                                                             |
| GET    | /users/search?query=... | List users whose name, username, or bio match the search query. | none                                                                             |


### FRIENDS


| Method | Path               | Description                                 | Body |
| ------ | ------------------ | ------------------------------------------- | ---- |
| POST   | /friends/:friendId | Send or accept a friend request.            | none |
| DELETE | /friends/:friendId | Remove a friend (delete both rows).         | none |
| GET    | /friends           | List all friends of the authenticated user. | none |


### FRIEND REQUESTS


| Method | Path                               | Description                                                           | Body |
| ------ | ---------------------------------- | --------------------------------------------------------------------- | ---- |
| POST   | /friend-requests/:receiverId       | Create a new friend request from authenticated user to :receiverId.   | none |
| GET    | /friend-requests/incoming          | List pending requests where authenticated user is the receiver.       | none |
| GET    | /friend-requests/outgoing          | List pending requests the authenticated user has sent.                | none |
| POST   | /friend-requests/:requestId/accept | Accept a friend request (inserts two rows into Friends: A↔B and B↔A). | none |
| POST   | /friend-requests/:requestId/reject | Reject a friend request (status = rejected).                          | none |
| DELETE | /friend-requests/:requestId        | Cancel a pending request the user sent (status = canceled).           | none |


### PRACTICE SESSIONS


| Method | Path                 | Description                                   | Body                                                                                                  |
| ------ | -------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| POST   | /sessions            | Create a practice session.                    | { title, postText?, privateText?, instrument?, duration, tempo?, pieceTitle?, composer?, visibility } |
| GET    | /sessions/feed       | Get one page of sessions visible to the user. | { lastItem, pageSize }                                                                                |
| GET    | /sessions/:sessionId | Fetch a single session.                       | none                                                                                                  |
| PATCH  | /sessions/:sessionId | Update a session.                             | any editable session fields                                                                           |
| DELETE | /sessions/:sessionId | Delete a session.                             | none                                                                                                  |


### MEDIA


| Method | Path                       | Description                | Body          |
| ------ | -------------------------- | -------------------------- | ------------- |
| POST   | /sessions/:sessionId/media | Attach media to a session. | { type, url } |
| GET    | /sessions/:sessionId/media | List media for a session.  | none          |
| DELETE | /media/:mediaId            | Delete a media item.       | none          |


### LIKES


| Method | Path                       | Description                       | Body |
| ------ | -------------------------- | --------------------------------- | ---- |
| POST   | /sessions/:sessionId/likes | Like a session.                   | none |
| DELETE | /sessions/:sessionId/likes | Unlike a session.                 | none |
| GET    | /sessions/:sessionId/likes | List users who liked the session. | none |


### COMMENTS


| Method | Path                          | Description       | Body     |
| ------ | ----------------------------- | ----------------- | -------- |
| POST   | /sessions/:sessionId/comments | Add a comment.    | { text } |
| GET    | /sessions/:sessionId/comments | List comments.    | none     |
| DELETE | /comments/:commentId          | Delete a comment. | none     |


### CHALLENGES


| Method | Path                                | Description                                                  | Body                                             |
| ------ | ----------------------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| GET    | /challenges                         | List all challenges.                                         | none                                             |
| POST   | /challenges                         | Create a challenge (admin only; may be done manually in DB). | { description, task, targetNumber, instrument? } |
| GET    | /challenges/:challengeId            | Fetch a challenge.                                           | none                                             |
| POST   | /challenges/:challengeId/complete   | Mark challenge as completed for the user.                    | none                                             |
| GET    | /users/:userId/completed-challenges | List completed challenges for a user.                        | none                                             |


### NOTIFICATIONS


| Method | Path                                | Description                      | Body |
| ------ | ----------------------------------- | -------------------------------- | ---- |
| GET    | /notifications                      | List notifications for the user. | none |
| PATCH  | /notifications/:notificationId/read | Mark a notification as read.     | none |
| DELETE | /notifications/:notificationId      | Delete a notification.           | none |


### EVENTS


| Method | Path             | Description                                    | Body                                                                                                           |
| ------ | ---------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| POST   | /events          | Create an event.                               | { title, description, date, startTime, endTime, isAllDay, location, reminderMinBefore, eventType, visibility } |
| GET    | /events/:month   | List visible events during the selected month. | none                                                                                                           |
| GET    | /events/:eventId | Fetch a single event.                          | none                                                                                                           |
| PATCH  | /events/:eventId | Update an event.                               | any editable event fields                                                                                      |
| DELETE | /events/:eventId | Delete an event.                               | none                                                                                                           |


### OPTIONAL


| Method | Path                | Description                                                                             | Body |
| ------ | ------------------- | --------------------------------------------------------------------------------------- | ---- |
| GET    | /search?q=...       | Unified search across users, sessions, events (e.g. for home screen).                   | none |
| GET    | /stats/user/:userId | Aggregated practice stats (e.g. number of sessions, total hours practiced) for profile. | none |


---

## Key User and System Flows

### Search

User types a query and presses Enter or clicks search → frontend calls `GET /users/search?query=...` → backend runs database query and returns paginated results.

### Feed (infinite scroll)

Frontend displays a feed skeleton (e.g. Suspense), calls `GET /sessions/feed` with body `{ lastItem, pageSize }`. Backend uses JOIN, ORDER, LIMIT with keyset pagination on `createdAt`. Returns one page at a time. InfiniteScroll component (e.g. invisible 1px trigger) calls reload for the next page.

### Login

User submits email + password. Frontend stores access token in memory and uses it for API calls; auto-refresh when it expires (proactive and reactive). Backend verifies password, issues a new refresh token (cookie), and returns an access token. Frontend stores access token, then redirects into the app.

### Register

User submits email, password, username, first/last name, bio, profile pic, etc. Backend validates email format, hashes password with bcrypt, stores user in DB, creates refresh token (HTTP-only cookie), returns access token (JSON).

### View Friend's profile

Frontend-only behavior; use URL/profile prop to show that user’s profile (subject to privacy).

### Metronome (tool)

Frontend-only; available from anywhere. Use Tone.js as the audio scheduler. User can set BPM and time signature.

### Tuner (tool)

Frontend-only; available from anywhere. Use "Pitchy" as the pitch-detection library with a friendly UI.

### Start a new practice session

1. User selects an instrument from a dropdown (from profile instruments).
2. A practiceSession is created in the database, a timer is started, and the user is directed to a simplified UI with only the session actions below.
3. User can record audio, record video, add sheet music, and use Metronome/Tuner.

### Timer (session)

Event-based to handle reloads or connection issues. Frontend sends `startTimer` to the server; frontend shows a timer and increments every second (e.g. setTimeout 1000ms). Server runs its own timer. Frontend pings every 5–10 seconds or after reload with `syncTimer`; ±1s buffer is acceptable; otherwise frontend adjusts to match backend. On end session, frontend sends `stopTimer`; server time is the official session length.

### Record audio

Request microphone permission the first time. User presses Record → audio records until stop/pause → clip is added to the session list with playback. Frontend uploads file to object storage, then sends URLs to the backend to store in the DB.

### Record video

Request camera permission the first time. User presses Record → audio+video until stop/pause → video added to list with playback. Frontend uploads to object storage, sends URLs to backend.

### Sheet music

User can upload a PDF (or select from a list). File explorer opens; user selects file → file is shown on frontend (e.g. pdfjs). If they already have uploads, they can pick from a dropdown populated by backend; selected file is fetched from object storage and displayed. New file is sent to object storage.

### End session

Timer is stopped on the server. User sees a form to set: post visibility (default from profile), which audio/video clips to include/exclude, practice tempo, pieces practiced (title, composer), optional text. Post is optimistically shown at the top of the user’s feed; full post data is sent to the backend. When the backend receives the new practice session, it updates challenge progress. If a challenge was completed in that session, the user should see a banner (unless a websocket is added, completed challenges may need to be part of the “create post” response so the frontend can show the banner).

### Comment / Like a post

Frontend calls the session comments and likes API endpoints.

---

## Events and Calendar

Calendar is for scheduling and viewing events (lessons, regular practice time, recitals/performances). Recitals/performances use the **performance** eventType (same enum as practice and lesson); show them in a different color in the UI. Event fields (date, startTime, endTime, isAllDay, location, reminderMinBefore, visibility, etc.) are defined in [Data Access](#data-access-and-database-layer).

---

## Reliability

- **Database:** Supabase provides managed PostgreSQL with high availability, backups, and point-in-time recovery.
- **Media storage:** Oracle Cloud Object Storage (see [Data Access](#data-access-and-database-layer)) provides durable storage for session media.
- **Session timer:** Event-based timer with frontend–backend sync keeps session duration accurate across reloads; backend is source of truth (see [Timer (session)](#timer-session) in Key Flows).
- **Optimistic UI:** New practice session posts are shown immediately while the backend processes the request (see [End session](#end-session)).
- **Token refresh:** Access tokens are refreshed proactively and reactively to keep sessions active.

---

## Performance

- **Feed:** Keyset pagination on `createdAt` and infinite scroll (see [Feed](#feed-infinite-scroll)) keep the feed efficient as data grows.
- **Media:** Files are uploaded from the frontend to object storage (see [Data Access](#data-access-and-database-layer)), keeping the database lean and enabling efficient delivery.
- **Hosting:** Frontend runs locally or via ngrok (see [Cost](#cost)).
- **Architecture:** Service-layer separation allows caching and efficient data handling; Supabase supports scaling without app changes.

---

## Functionality

Summary of what Koda supports (details in API, Key Flows, and UI sections): practice session tracking with timer, audio/video/sheet music and posts; friends, likes, comments, and profile viewing; challenges with progress and completion notifications; event scheduling (practice, lessons, performances) on the calendar; metronome and tuner; visibility controls (public, private, friends); user search; and notifications;.

---

## Compatibility

- **Web:** Runs in any modern browser (Chrome, Firefox, Safari, Edge) on desktop, laptop, tablet, or phone. Uses MediaRecorder API for audio/video.
- **Frontend:** Runs locally or via ngrok tunnel (see [Cost](#cost)).
- **Database:** Supabase exposes standard PostgreSQL.
- **Media:** Audio/video in browser-friendly formats; sheet music as PDF.

---

## Cost

Koda runs **100% free**: Supabase (database) and Oracle Cloud Object Storage (media) on free tiers; frontend runs locally or via ngrok free tier. No infrastructure or hosting cost. If usage later exceeds free tiers, the stack can move to paid tiers without changing the architecture.