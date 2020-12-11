import { logger } from "./logger";

const { env } = process;

if (env.PORT && isNaN(parseInt(env.PORT, 10))) {
  throw new Error("PORT must be a valid port number.");
}

if (!env.BRIDGE_SERVER_URL) {
  throw new Error("BRIDGE_SERVER_URL must be a valid URL.");
}

if (env.UDP_RECEIVE_PORT && isNaN(parseInt(env.UDP_RECEIVE_PORT, 10))) {
  throw new Error("PORT must be a valid port number.");
}

if (env.UDP_SEND_PORT && isNaN(parseInt(env.UDP_SEND_PORT, 10))) {
  throw new Error("PORT must be a valid port number.");
}

if (env.NODE_ENV !== "development" && !env.TOKEN_SIGNING_SECRET) {
  throw new Error("TOKEN_SIGNING_SECRET must have a value.");
}

export const PORT = env.PORT ? parseInt(env.PORT, 10) : 3000;
export const BRIDGE_SERVER_URL = env.BRIDGE_SERVER_URL;

export const UDP_SEND_HOST = env.UDP_SEND_HOST || "127.0.0.1";
export const UDP_RECEIVE_PORT = env.UDP_RECEIVE_PORT
  ? parseInt(env.UDP_RECEIVE_PORT, 10)
  : 9000;
export const UDP_SEND_PORT = env.UDP_SEND_PORT
  ? parseInt(env.UDP_SEND_PORT, 10)
  : 9001;

export const TOKEN_SIGNING_SECRET = env.TOKEN_SIGNING_SECRET || "notasecret";

logger.info("Config loaded.", {
  PORT,
  BRIDGE_SERVER_URL,
  UDP_RECEIVE_PORT,
  UDP_SEND_PORT,
  TOKEN_SIGNING_SECRET,
});
