# Koda Data Model and Storage

Use this document when you need table definitions, entity relationships, ID conventions, visibility rules, and media storage guidance.

## Core Data Conventions

- **Database IDs**: Primary and foreign key IDs (`userId`, `practiceLogId`, etc.) are UUIDs (string type in application and DB).
- **Shared enums**: Use shared enums for visibility and all "this | that" style union types across frontend and backend.
- **Visibility**: Post visibility is defined only on the User as `postVisibility` and acts as the default for all of the user practice logs (no per-log visibility override).

## Database Tables

- **User** — `userId` (PK, UUID), `email`, `username`, `password` (encrypted), `profilePhoto`, `bio`, `postVisibility`, `instruments[]`, `createdAt`, `updatedAt`
- **Friends** — `userId` (FK), `friendId` (FK), `friendsSince`; PK (`userId`, `friendId`). Store two rows per friendship: `(1,2)` and `(2,1)`. Delete both when users unfriend.
- **FriendRequests** — `requestId` (PK), `senderId` (FK), `receiverId` (FK), `status` (`pending | accepted | rejected | canceled`), `createdAt`, `respondedAt`
- **practiceLog** — `userID` (FK), `practiceLogID` (PK), `title`, `postText?`, `privateText?`, `instrument?`, `createdAt`, `durationMinutes` (number), `tempo?`, `pieceTitle?`, `composer?` (additional AI analysis fields may be added later). Visibility for a log is determined by the log owner `User.postVisibility`; there is no per-log visibility field.
- **Challenges** — `challengeId` (PK), `description`, `task`, `targetNumber`, `instrument?`
- **completedChallenges** — `userId` (FK), `challengeId` (FK), `completedAt`
- **Events** — `eventId` (PK), `title`, `description`, `date`, `startTime`, `endTime`, `isAllDay`, `location`, `reminderMinBefore`, `eventType` (`practice | lesson | performance`), `visibility` (`public | private | friends`)
- **media** — `mediaId` (PK), `practiceLogId` (FK), `type` (`audio | video | sheetMusic`), `url`, `createdAt`
- **Likes** — `userId` (FK), `practiceLogId` (FK), `createdAt`; PK (`userId`, `practiceLogId`)
- **Comments** — `commentId` (PK), `practiceLogId` (FK), `userId` (FK), `text`, `createdAt`
- **Notifications** — `notificationId` (PK), `userId` (FK), `actorId` (FK), `type` (`like | comment | friendRequest | challengeCompleted`), `entityType` (`practiceLog | user | challenge`), `entityId`, `createdAt`, `isRead`
- **authSessions** — `authSessionId` (PK), `userId` (FK, UUID), `tokenHash`, `createdAt`, `expiresAt` (~1hr), `revokedAt`

## Challenges Data Rules

Challenge descriptions should be human-readable (for example, "Complete 5 practice sessions"), while numeric and task fields drive logic:

- `targetNumber = 5`
- `task = numPracticeSessions`
- `instrument` is optional for instrument-specific challenges

Supported challenge task types include:

- `numPracticeSessions`
- `numAudioRecordings`
- `numVideoRecordings`
- `numFriends`
- `numHrsPracticed` (per instrument)

## Media Storage

- Audio clips, video, and sheet music are stored in Oracle Cloud Object Storage.
- Frontend uploads files to object storage, then backend stores the resulting full object URLs in the database (`media.url` and related fields).

## Related Docs

- API endpoints using these models: `docs/KODA-API-Surface.md`
- Frontend architecture and media API layering: `docs/KODA-Frontend-Architecture.md`
- End-to-end user/system flows: `docs/KODA-Key-Flows-and-UX.md`
