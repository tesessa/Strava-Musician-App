import type { KodaServerApi } from "./network/KodaServerApi";
import { ServerFacade } from "./network/ServerFacade";
import { FakeDataServer } from "./network/FakeDataServer";
import type { KodaMediaApi } from "./media/KodaMediaApi";
import { MediaService } from "./media/MediaService";
import { FakeMediaService } from "./media/FakeMediaService";
import { UserService } from "./service/UserService";
import { PracticeLogService } from "./service/PracticeLogService";
import { LikesService } from "./service";
import { CommentsService } from "./service";
import { MediaUploadService } from "./service";
import { FriendService } from "./service";

/**
 * This file sets up singleton services to be used by components and hooks.
 * The server type (either fake data or real server) is determined by the
 * VITE_DEMO_MODE environment variable, which you will need to set in your own .env file.
 */

function createServer(): KodaServerApi {
  // const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
  if (import.meta.env.VITE_DEMO_MODE === "true") {
    return new FakeDataServer();
  }
  return new ServerFacade();
}

function createMediaApi(): KodaMediaApi {
  if (import.meta.env.VITE_DEMO_MODE === "true") {
    return new FakeMediaService();
  }
  return new MediaService();
}

const server: KodaServerApi = createServer();
const mediaApi: KodaMediaApi = createMediaApi();

/** Singleton UserService with server implementation injected (demo vs real from env). */
export const userService = new UserService(server);
export const practiceLogService = new PracticeLogService(server);
export const likesService = new LikesService(server);
export const commentsService = new CommentsService(server);
export const mediaUploadService = new MediaUploadService(mediaApi, server);
export const friendService = new FriendService(server);

export { mediaApi };
