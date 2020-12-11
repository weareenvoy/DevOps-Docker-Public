import { logger } from "./logger";

const { env } = process;

if (env.PORT && isNaN(parseInt(env.PORT, 10))) {
  throw new Error("PORT must be a valid port number.");
}

if (env.NODE_ENV !== "development" && !env.TOKEN_SIGNING_SECRET) {
  throw new Error("TOKEN_SIGNING_SECRET must have a value.");
}

export const PORT = env.PORT ? parseInt(env.PORT, 10) : 3000;

export const TOKEN_SIGNING_SECRET = env.TOKEN_SIGNING_SECRET || "notasecret";

logger.info("Config loaded.", { PORT, TOKEN_SIGNING_SECRET });
