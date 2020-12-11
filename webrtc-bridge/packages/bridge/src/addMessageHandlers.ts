import * as WebSocket from "ws";
import * as jwt from "jsonwebtoken";

import { logger } from "./logger";
import { TOKEN_SIGNING_SECRET } from "./config";

const authClients: { [key: string]: WebSocket | null } = {
  car: null,
  controller: null,
};
const authClientNames = Object.keys(authClients);

const viewers: WebSocket[] = [];
let settings = { width: 1280, height: 720 };

let framesForwarded = 0;
let udpToCar = 0;
let udpToController = 0;

setInterval(() => {
  logger.debug("Stats", {
    video: { viewers: viewers.length, framesForwarded },
    udp: { udpToCar, udpToController },
  });
}, 5000);

export const addVideoHandlers = (wsServer: WebSocket.Server, ws: WebSocket) => {
  let isAuthenticated = false;
  let name: string = "";

  const verifyClient = (token?: string) => {
    if (isAuthenticated) {
      return true;
    }

    if (!token) {
      // Don't close. We may receive a UDP packet before a message with a token.
      logger.error("Unauthenticated client: missing token");
      return false;
    } else if (typeof token !== "string") {
      ws.close();
      logger.error("Unauthenticated client: invalid token type");
      return false;
    }

    const decodedToken = jwt.verify(token!, TOKEN_SIGNING_SECRET, {
      algorithms: ["HS256"],
    });

    const sub = (decodedToken as any).sub;

    if (authClientNames.includes(sub)) {
      authClients[sub] = ws;
      isAuthenticated = true;
      name = sub;
      logger.info("Authenticated client connected", decodedToken);
      ws.send(
        JSON.stringify({ type: "authentication-succeeded", target: sub }),
      );
      return true;
    } else {
      ws.close();
      logger.error("Unknown client disconnected", decodedToken);
      return false;
    }
  };

  const removeViewer = () => {
    const index = viewers.indexOf(ws);
    if (index >= 0) {
      const [ws] = viewers.splice(index, 1);
      logger.info("Video viewer removed", { viewers: viewers.length });
    }
  };

  const broadcast = (data: any, options?: {}) => {
    try {
      viewers.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data, options as {});
          if (logger.isSillyEnabled()) {
            logger.silly("Forwarding video frame", {
              data: data.slice(0, 8),
            });
          }
        }
      });
    } catch (err) {
      logger.error("Error broadcasting message");
    }
  };

  const handleJsonMessage = (data: any) => {
    const message = JSON.parse(data.toString());

    if (message.type && typeof message.type === "string") {
      if (!verifyClient(message.token)) {
        // Drop any message that arrives before authentication.
        return;
      }

      switch (message.type) {
        case "video-settings": {
          logger.info("New video settings received", {
            settings: message.settings,
          });
          settings = message.settings;
          const { width, height } = settings;
          broadcast(JSON.stringify({ action: "init", width, height }));
          break;
        }

        case "udp-packet": {
          const { target } = message;

          if (target && authClients[target]) {
            authClients[target]!.send(data);

            if (target === "car") {
              udpToCar++;
              logger.silly("UDP packet forwarded", { target });
            } else if (target === "controller") {
              udpToController++;
              logger.silly("UDP packet forwarded", { target });
            } else {
              logger.silly("UDP packet received for unknown target", {
                target,
              });
            }
          } else {
            logger.silly("UDP packet received for disconnected target", {
              from: name,
              target,
              car: !!authClients.car,
              controller: !!authClients.controller,
            });
          }
        }
      }
    }
  };

  const handleVideoMessage = (type: string, data: any) => {
    switch (type) {
      case "REQUESTSTR": {
        if (!viewers.includes(ws)) {
          viewers.push(ws);
          const { width, height } = settings;
          ws.send(JSON.stringify({ action: "init", width, height }));

          logger.info("Video viewer added.", {
            viewers: viewers.length,
          });
        }

        if (authClients.car?.readyState === WebSocket.OPEN) {
          authClients.car.send(
            JSON.stringify({ type: "start-video", target: "car", data: {} }),
          );
          logger.info("Requested a video restart");
        } else {
          logger.warn("Video requested, but car is not connected");
        }

        break;
      }

      case "STOPSTREAM": {
        removeViewer();

        if (viewers.length === 0) {
          if (authClients.car?.readyState === WebSocket.OPEN) {
            authClients.car.send(
              JSON.stringify({ type: "stop-video", target: "car", data: {} }),
            );
            logger.info("Requested video stop");
          } else {
            logger.warn("Video stop requested, but car is not connected");
          }
        }

        break;
      }

      default: {
        broadcast(data, { binary: true });

        framesForwarded++;

        if (logger.isSillyEnabled()) {
          logger.silly("Video frame broadcast", { viewers: viewers.length });
        }
      }
    }
  };

  ws.on("close", () => {
    removeViewer();
    if (name) {
      authClients[name] = null;
    }
    logger.info("Connection closed", { client: name });
  });

  ws.on("error", (err) => {
    removeViewer();
    logger.error("Connection error", err);
  });

  ws.on("message", (data) => {
    try {
      if (data.slice(0, 1).toString() === "{") {
        handleJsonMessage(data);
      } else {
        const type = data.slice(0, 10).toString().trim();
        handleVideoMessage(type, data);
      }
    } catch (err) {
      logger.error("Error handling message", { err });
    }
  });
};
