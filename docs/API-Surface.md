# Koda API Surface

Use this document to find endpoint contracts quickly. It mirrors backend route groups and request/response expectations.

## Users and Auth

| Method | Path                           | Description                                                             | Body                                                                |
| ------ | ------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| POST   | `/auth/register`               | Create a new user. New users get postVisibility `"friends"` by default. | `{ email, username, password }`                                     |
| POST   | `/auth/login`                  | Authenticate and return a token.                                        | `{ email, password }`                                               |
| POST   | `/auth/logout`                 | Revoke current session token (delete or mark revoked).                  | none                                                                |
| GET    | `/auth/me`                     | Return the authenticated user profile if token is valid.                | none                                                                |
| GET    | `/users/:userId`               | Fetch a user profile.                                                   | none                                                                |
| PATCH  | `/users/:userId`               | Update profile fields.                                                  | `{ username?, bio?, profilePhoto?, instruments?, postVisibility? }` |
| GET    | `/users/:userId/practice-logs` | List visible practice logs for a user (keyset pagination).              | `{ lastItem, pageSize }`                                            |
| GET    | `/users/search?query=...`      | List users whose name, username, or bio match the search query.         | none                                                                |

## Friends

| Method | Path                 | Description                                                     | Body                     |
| ------ | -------------------- | --------------------------------------------------------------- | ------------------------ |
| DELETE | `/friends/:friendId` | Remove a friend (delete both rows).                             | none                     |
| GET    | `/friends`           | List all friends of the authenticated user (keyset pagination). | `{ lastItem, pageSize }` |

## Friend Requests

| Method | Path                                 | Description                                                                         | Body                     |
| ------ | ------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------ |
| POST   | `/friend-requests/:receiverId`       | Create a new friend request from authenticated user to `:receiverId`.               | none                     |
| GET    | `/friend-requests/incoming`          | List pending requests where authenticated user is the receiver (keyset pagination). | `{ lastItem, pageSize }` |
| GET    | `/friend-requests/outgoing`          | List pending requests the authenticated user has sent (keyset pagination).          | `{ lastItem, pageSize }` |
| POST   | `/friend-requests/:requestId/accept` | Accept a friend request (inserts two rows into Friends: A<->B and B<->A).           | none                     |
| POST   | `/friend-requests/:requestId/reject` | Reject a friend request (`status = rejected`).                                      | none                     |
| DELETE | `/friend-requests/:requestId`        | Cancel a pending request the user sent (`status = canceled`).                       | none                     |

## Practice Logs

| Method | Path                            | Description                                        | Body                                                                                                                                                                                 |
| ------ | ------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/practice-logs`                | Create a practice log.                             | `{ title, postText?, privateText?, instrument?, durationMinutes (number), tempo?, pieceTitle?, composer? }` (visibility is the authenticated user postVisibility from their profile) |
| GET    | `/practice-logs/feed`           | Get one page of practice logs visible to the user. | `{ lastItem, pageSize }`                                                                                                                                                             |
| GET    | `/practice-logs/:practiceLogId` | Fetch a single practice log.                       | none                                                                                                                                                                                 |
| PATCH  | `/practice-logs/:practiceLogId` | Update a practice log.                             | any editable practice log fields                                                                                                                                                     |
| DELETE | `/practice-logs/:practiceLogId` | Delete a practice log.                             | none                                                                                                                                                                                 |

## Media

| Method | Path                                  | Description                     | Body            |
| ------ | ------------------------------------- | ------------------------------- | --------------- |
| POST   | `/practice-logs/:practiceLogId/media` | Attach media to a practice log. | `{ type, url }` |
| GET    | `/practice-logs/:practiceLogId/media` | List media for a practice log.  | none            |
| DELETE | `/media/:mediaId`                     | Delete a media item.            | none            |

## Likes

| Method | Path                                  | Description                           | Body |
| ------ | ------------------------------------- | ------------------------------------- | ---- |
| POST   | `/practice-logs/:practiceLogId/likes` | Like a practice log.                  | none |
| DELETE | `/practice-logs/:practiceLogId/likes` | Unlike a practice log.                | none |
| GET    | `/practice-logs/:practiceLogId/likes` | List all the likes on a practice log. | none |

## Comments

| Method | Path                                     | Description       | Body       |
| ------ | ---------------------------------------- | ----------------- | ---------- |
| POST   | `/practice-logs/:practiceLogId/comments` | Add a comment.    | `{ text }` |
| GET    | `/practice-logs/:practiceLogId/comments` | List comments.    | none       |
| DELETE | `/comments/:commentId`                   | Delete a comment. | none       |

## Challenges

| Method | Path                                  | Description                                                  | Body                                               |
| ------ | ------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| GET    | `/challenges`                         | List all challenges.                                         | none                                               |
| POST   | `/challenges`                         | Create a challenge (admin only; may be done manually in DB). | `{ description, task, targetNumber, instrument? }` |
| GET    | `/challenges/:challengeId`            | Fetch a challenge.                                           | none                                               |
| POST   | `/challenges/:challengeId/complete`   | Mark challenge as completed for the user.                    | none                                               |
| GET    | `/users/:userId/completed-challenges` | List completed challenges for a user.                        | none                                               |

## Notifications

| Method | Path                                  | Description                      | Body |
| ------ | ------------------------------------- | -------------------------------- | ---- |
| GET    | `/notifications`                      | List notifications for the user. | none |
| PATCH  | `/notifications/:notificationId/read` | Mark a notification as read.     | none |
| DELETE | `/notifications/:notificationId`      | Delete a notification.           | none |

## Events

| Method | Path               | Description                                    | Body                                                                                                             |
| ------ | ------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| POST   | `/events`          | Create an event.                               | `{ title, description, date, startTime, endTime, isAllDay, location, reminderMinBefore, eventType, visibility }` |
| GET    | `/events/:month`   | List visible events during the selected month. | none                                                                                                             |
| GET    | `/events/:eventId` | Fetch a single event.                          | none                                                                                                             |
| PATCH  | `/events/:eventId` | Update an event.                               | any editable event fields                                                                                        |
| DELETE | `/events/:eventId` | Delete an event.                               | none                                                                                                             |

## Optional

| Method | Path                  | Description                                                                      | Body |
| ------ | --------------------- | -------------------------------------------------------------------------------- | ---- |
| GET    | `/search?q=...`       | Unified search across users, practice logs, events (for home screen search).     | none |
| GET    | `/stats/user/:userId` | Aggregated practice stats (for example number of logs, total hours) for profile. | none |

## Related Docs

- Backend architecture and ownership: `docs/KODA-Backend-Architecture.md`
- Data entities backing these contracts: `docs/KODA-Data-Model-and-Storage.md`
- End-to-end call patterns: `docs/KODA-Key-Flows-and-UX.md`
