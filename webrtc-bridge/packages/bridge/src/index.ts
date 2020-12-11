import { config as loadDotEnvFile } from "dotenv";
loadDotEnvFile();

import * as WebSocket from "ws";

import { createHttpServer } from "./http";
import { logger } from "./logger";
import { PORT } from "./config";
import { addVideoHandlers } from "./addMessageHandlers";

// Set up http endpoints. These are standard expressjs routes.
// We don't add any, because we're just using it as a host for websockets.
const server = createHttpServer((app) => {
  // Add express routes here.
});

const wss = new WebSocket.Server({ server, perMessageDeflate: false });
wss.on("connection", (ws, req) => {
  const clientIP =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  logger.info("WebSocket client connected", { clientIP });

  ws.onclose = () => logger.info("Client disconnected", { clientIP });
  ws.onerror = (err) => logger.error("Error in websocket", { clientIP, err });

  addVideoHandlers(wss, ws);
});

// Start the server.
server.listen(PORT);

logger.info(`Server listening on port ${PORT}`, { startedAt: new Date() });
