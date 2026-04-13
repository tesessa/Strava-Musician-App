import * as commentsHandlers from "../../api/handlers/commentsHandlers";
import { NextResponse } from "next/server";
import * as authHandlers from "../../api/handlers/authHandlers";
import * as practiceLogHandlers from "../../api/handlers/practiceLogHandlers";
import * as userHandlers from "../../api/handlers/userHandlers";
import * as friendsHandlers from "../../api/handlers/friendsHandlers";
import * as friendRequestHandlers from "../../api/handlers/friendRequestHandlers";
import * as mediaHandlers from "../../api/handlers/mediaHandlers";
import * as likesHandlers from "../../api/handlers/likesHandlers";
import * as challengesHandlers from "../../api/handlers/challengesHandlers";
import * as notificationsHandlers from "../../api/handlers/notificationsHandlers";
import * as aiHandlers from "../../api/handlers/aiHandlers";

// Add CORS headers to all responses
function withCORS(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

// Handle preflight requests
export async function OPTIONS() {
  return withCORS(new Response(null, { status: 204 }));
}

export async function GET(req: Request) { return withCORS(await dispatch(req, "GET")); }
export async function POST(req: Request) { return withCORS(await dispatch(req, "POST")); }
export async function PUT(req: Request) { return withCORS(await dispatch(req, "PUT")); }
export async function PATCH(req: Request) { return withCORS(await dispatch(req, "PATCH")); }
export async function DELETE(req: Request) { return withCORS(await dispatch(req, "DELETE")); }

async function dispatch(req: Request, method: string) {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean);

  let res: Response | NextResponse | null = null;

  // /health
  if (parts[0] === "health" && method === "GET") {
    res = NextResponse.json({ status: "ok" });
  }

  // /auth/*
  if (parts[0] === "auth") {
    if (parts[1] === "login" && method === "POST") res = await authHandlers.login(req);
    else if (parts[1] === "logout" && method === "POST") res = await authHandlers.logout(req);
    else if (parts[1] === "register" && method === "POST") res = await authHandlers.register(req);
    else if (parts[1] === "me" && method === "GET") res = await authHandlers.me?.(req) || NextResponse.json({ error: "not_implemented" }, { status: 501 });
  }

    // /users/*
  if (parts[0] === "users") {
    if (parts[1] === "search" && method === "GET") res = await userHandlers.searchUsers(req);
    else if (parts.length === 2 && method === "GET") res = await userHandlers.getUser(req, parts[1]);
    // /users/:userId/practice-logs
    else if (parts.length === 3 && parts[2] === "practice-logs" && method === "GET") {
      const practiceLogHandlers = await import("../../api/handlers/practiceLogHandlers");
      res = await practiceLogHandlers.getUserPracticeLogs(req, parts[1]);
    }
    else if (parts.length === 2 && method === "PATCH") res = await userHandlers.updateUser(req, parts[1]);
    else if (parts.length === 2 && method === "DELETE") res = await userHandlers.deleteUser(req, parts[1]);
  }

  // /practice-logs, /practice-logs/feed, /practice-logs/:practiceLogId
  if (parts[0] === "practice-logs") {
    if (parts.length === 1 && method === "POST") res = await practiceLogHandlers.createPracticeLog(req);
    else if (parts[1] === "feed" && method === "GET") res = await practiceLogHandlers.getFeed(req);
    else if (parts.length === 2 && method === "GET") res = await practiceLogHandlers.getPracticeLog(req, parts[1]);
    else if (parts.length === 2 && method === "PATCH") res = await practiceLogHandlers.updatePracticeLog(req, parts[1]);
    else if (parts.length === 2 && method === "DELETE") res = await practiceLogHandlers.deletePracticeLog(req, parts[1]);
  }

  if (parts[0] === "friends") {
    if (parts.length === 1 && method === "GET") {
      res = await friendsHandlers.listFriends(req);
    } else if (parts.length === 2 && method === "DELETE") {
      res = await friendsHandlers.removeFriend(req, parts[1]);
    } else if (parts.length === 3 && parts[1] === "is-friend" && method === "GET") {
      res = await friendsHandlers.isFriend(req, parts[2]);
    }
  }

  if (parts[0] === "friend-requests") {
    if (parts.length === 2 && method === "POST") {
      res = await friendRequestHandlers.createFriendRequest(req, parts[1]);
    } else if (parts[1] === "incoming" && method === "GET") {
      res = await friendRequestHandlers.listIncoming(req);
    } else if (parts[1] === "outgoing" && method === "GET") {
      res = await friendRequestHandlers.listOutgoing(req);
    } else if (parts.length === 3 && parts[2] === "accept" && method === "POST") {
      res = await friendRequestHandlers.acceptRequest(req, parts[1]);
    } else if (parts.length === 3 && parts[2] === "reject" && method === "POST") {
      res = await friendRequestHandlers.rejectRequest(req, parts[1]);
    } else if (parts.length === 2 && method === "DELETE") {
      res = await friendRequestHandlers.cancelRequest(req, parts[1]);
    }
  }


  // /practice-logs/:practiceLogId/media (POST, GET)
  if (parts[0] === "practice-logs" && parts.length === 3 && parts[2] === "media") {
    if (method === "POST") {
      res = await mediaHandlers.createMedia(req, parts[1]);
    } else if (method === "GET") {
      res = await mediaHandlers.listMedia(req, parts[1]);
    }
  }

  // /practice-logs/:practiceLogId/comments (POST, GET)
  if (parts[0] === "practice-logs" && parts.length === 3 && parts[2] === "comments") {
    if (method === "POST") {
      res = await commentsHandlers.createComment(req, parts[1]);
    } else if (method === "GET") {
      res = await commentsHandlers.listComments(req, parts[1]);
    }
  }

  // /comments/:commentId (DELETE)
  if (parts[0] === "comments" && parts.length === 2 && method === "DELETE") {
    res = await commentsHandlers.deleteComment(req, parts[1]);
  }

  // /practice-logs/:practiceLogId/likes (POST, DELETE, GET)
  if (parts[0] === "practice-logs" && parts.length === 3 && parts[2] === "likes") {
    if (method === "POST") {
      res = await likesHandlers.likePracticeLog(req, { params: { practiceLogId: parts[1] } });
    } else if (method === "DELETE") {
      res = await likesHandlers.unlikePracticeLog(req, { params: { practiceLogId: parts[1] } });
    } else if (method === "GET") {
      res = await likesHandlers.getPracticeLogLikes(req, { params: { practiceLogId: parts[1] } });
    }
  }

  // /media/:mediaId (DELETE)
  if (parts[0] === "media" && parts.length === 2 && method === "DELETE") {
    res = await mediaHandlers.deleteMedia(req, parts[1]);
  }

  // /challenges (GET, POST)
  if (parts[0] === "challenges" && parts.length === 1) {
    if (method === "GET") {
      res = await challengesHandlers.listChallenges(req);
    } else if (method === "POST") {
      res = await challengesHandlers.createChallenge(req);
    }
  }

  // /challenges/:challengeId (GET)
  if (parts[0] === "challenges" && parts.length === 2 && method === "GET") {
    res = await challengesHandlers.getChallenge(req, parts[1]);
  }

  // /challenges/:challengeId/complete (POST)
  if (parts[0] === "challenges" && parts.length === 3 && parts[2] === "complete" && method === "POST") {
    res = await challengesHandlers.completeChallenge(req, parts[1]);
  }

  // /users/:userId/completed-challenges (GET)
  if (parts[0] === "users" && parts.length === 3 && parts[2] === "completed-challenges" && method === "GET") {
    res = await challengesHandlers.listCompletedChallenges(req, parts[1]);
  }

  // /notifications (GET)
  if (parts[0] === "notifications" && parts.length === 1 && method === "GET") {
    res = await notificationsHandlers.listNotifications(req);
  }

  // /notifications/:notificationId/read (PATCH)
  if (parts[0] === "notifications" && parts.length === 3 && parts[2] === "read" && method === "PATCH") {
    res = await notificationsHandlers.markNotificationRead(req, parts[1]);
  }

  // /notifications/:notificationId (DELETE)
  if (parts[0] === "notifications" && parts.length === 2 && method === "DELETE") {
    res = await notificationsHandlers.deleteNotification(req, parts[1]);
  }

  // add ai endpoint here
  // create a handler in api/handlers
  // the handler should call the ai service and return the response
  if (parts[0] === "ai" && method === "POST") {
    res = await aiHandlers.analyzeAudio(req);
  }
  
  // fallback: 404
  if (!res) {
    res = NextResponse.json({ error: "path_not_found" }, { status: 404 });
  }

  return res;
}