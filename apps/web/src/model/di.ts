import type { KodaServerApi } from "./network/KodaServerApi";
import { ServerFacade } from "./network/ServerFacade";
import { FakeDataServer } from "./network/FakeDataServer";
import { UserService } from "./service/UserService";

/**
 * This file sets up singleton services to be used by components and hooks.
 * The server type (either fake data or real server) is determined by the
 * VITE_DEMO_MODE environment variable, which you will need to set in your own .env file.
 */

function createServer(): KodaServerApi {
  if (import.meta.env.VITE_DEMO_MODE === "true") {
    return new FakeDataServer();
  }
  return new ServerFacade();
}

const server: KodaServerApi = createServer();

/** Singleton UserService with server implementation injected (demo vs real from env). */
export const userService = new UserService(server);
