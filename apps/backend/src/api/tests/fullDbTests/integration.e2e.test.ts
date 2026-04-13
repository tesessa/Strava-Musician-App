// integration.e2e.test.ts
// Runs all fullDbTests in order, sharing a single testContext

import './authentication.e2e.test';
import './users.e2e.test';
import './friendsAndFriendRequests.e2e.test';
import './practiceLogs.e2e.test';
import './media.e2e.test';
import './likes.e2e.test';
import './comments.e2e.test';
import './notifications.e2e.test';

// This file should be run with Jest to ensure all tests share the same process and context.
// Usage: npx jest integration.e2e.test.ts --runInBand
