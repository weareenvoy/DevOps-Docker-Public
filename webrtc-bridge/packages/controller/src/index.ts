import { config as loadDotEnvFile } from "dotenv";
loadDotEnvFile();

import { join } from "path";
import * as cleanup from 'node-cleanup';
import * as express from "express";
import * as jwt from "jsonwebtoken";

import { createHttpServer } from "./http";
import { startUdpServer } from "./startUdpServer";
import {
  PORT,
  UDP_RECEIVE_PORT,
  BRIDGE_SERVER_URL,
  TOKEN_SIGNING_SECRET,
} from "./config";
import { logger } from "./logger";

import { sendUdp } from "./sendUdp";
import { WebSocketWrapper } from "./WebSocketWrapper";

const token = jwt.sign({ sub: "controller" }, TOKEN_SIGNING_SECRET, {
  algorithm: "HS256",
  expiresIn: "1d",
});

let toBridge = 0;
let toLocalhost = 0;
setInterval(() => {
  logger.debug("Stats", { udp: { toBridge, toLocalhost } });
}, 5000);

const wsUrl = BRIDGE_SERVER_URL.replace("http", "ws");
const ws = new WebSocketWrapper("controller", wsUrl);
ws.onJson("udp-packet", (message) => {
  toLocalhost++;
  sendUdp(message.data as Buffer);
  if (logger.isSillyEnabled()) {
    logger.silly("UDP message received from bridge", {
      data: (message.data as Buffer).toString(),
    });
  }
});
ws.connect();

const udpServer = startUdpServer({
  port: UDP_RECEIVE_PORT,

  onMessageReceived: (buffer) => {
    try {
      ws.sendJson({ type: "udp-packet", target: "car", data: buffer });

      toBridge++;

      if (logger.isSillyEnabled()) {
        logger.silly("UDP package forwarded to bridge", {
          data: buffer.toString(),
        });
      }
    } catch (err) {
      logger.error("Error forwarding UDP message to bridge", err);
    }
  },
});

const httpServer = createHttpServer((app) => {
  app.use(express.static(join(__dirname, "public")));
  app.use(express.static(join(__dirname, "vendor", "dist")));
}).listen(PORT, () => {
  logger.info(`HTTP server listening on ${PORT}`, { startedAt: new Date() });
});

cleanup((exitCode, signal) => {
  try {
    logger.info('Stopping app', { exitCode, signal });

    udpServer.close();
    logger.info('UDP server closed');

    httpServer.close();
    logger.info('HTTP server closed');

    ws.close();
    logger.info('Web socket closed');

  } catch (err) {
    logger.error("Error stopping app", err);
  }
})