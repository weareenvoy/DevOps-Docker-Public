import * as WebSocket from "ws";
import * as jwt from "jsonwebtoken";

import { BRIDGE_SERVER_URL, TOKEN_SIGNING_SECRET } from "./config";
import { logger } from "./logger";

const wsUrl = BRIDGE_SERVER_URL.replace("https", "ws").replace("http", "ws");

export interface JsonMessage {
  type: string;
  target?: string;
  data?: object;
}

export type JsonMessageHandler<T extends JsonMessage> = (message: T) => void;

export class WebSocketWrapper {
  isAuthenticated = false;
  private token: string;
  private ws: WebSocket | null = null;
  private onAuthenticatedHandlers: (() => void)[] = [];
  private jsonHandlers: { [key: string]: JsonMessageHandler<any>[] } = {};
  private binaryHandlers: ((data: WebSocket.Data) => void)[] = [];
  private connectTimeout: NodeJS.Timeout | null = null;

  get bufferedAmount() {
    return this.ws?.bufferedAmount || 0;
  }

  constructor(public readonly name: string, public readonly wsUrl: string) {
    this.token = jwt.sign({ sub: name }, TOKEN_SIGNING_SECRET, {
      algorithm: "HS256",
      expiresIn: "1d",
    });
    this.jsonHandlers["authentication-succeeded"] = [
      () => {
        this.isAuthenticated = true;
        logger.info("Web socket authenticated", { name: this.name });
        this.onAuthenticatedHandlers.forEach((handler) => handler());
      },
    ];
  }

  connect() {
    try {
      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout);
        this.connectTimeout = null;
      }

      this.connectTimeout = setTimeout(this.connect.bind(this), 5000);

      if (
        this.ws?.readyState === WebSocket.OPEN ||
        this.ws?.readyState === WebSocket.CONNECTING
      ) {
        return;
      } else if (this.ws) {
        this.ws.close();
      }

      logger.info("Connecting web socket...", { name: this.name });

      this.ws = new WebSocket(wsUrl, { perMessageDeflate: false }); 
      //this.ws = new WebSocket(wsUrl);

      this.ws.on("open", () => {
        logger.info("Web socket connected.", { name: this.name });
        this.authenticate();
      });

      this.ws.on("close", (code, reason) => {
        logger.error("Web socket closed", { name: this.name, code, reason });
      });

      this.ws.on("error", (err) => {
        logger.error("Error in web socket", { name: this.name, err });
      });

      this.ws.on("message", (data) => {
        try {
          if (data.slice(0, 1).toString() === "{") {
            this.handleJsonMessage(data);
          } else {
            this.handleBinaryMessage(data);
          }
        } catch (err) {
          logger.error("Error handling WS message", err);
        }
      });
    } catch (err) {
      logger.error("Error connecting web socket", err);
    }
  }

  authenticate() {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      logger.debug("Web socket not open. Message not sent.", {
        name: this.name,
      });
      return;
    }

    this.sendJson({ type: "authenticate", token: this.token });
  }

  onAuthenticated(handler: () => void) {
    this.onAuthenticatedHandlers.push(handler);
  }

  onJson<T extends JsonMessage>(
    messageType: string,
    handler: JsonMessageHandler<T>,
  ) {
    if (!this.jsonHandlers[messageType]) {
      this.jsonHandlers[messageType] = [];
    }

    this.jsonHandlers[messageType].push(handler);
  }

  onBinary(handler: (data: WebSocket.Data) => void) {
    this.binaryHandlers.push(handler);
  }

  sendJson<T extends JsonMessage>(message: T) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      logger.debug("Web socket not open. Message not sent.", {
        name: this.name,
      });
      return;
    }

    this.ws.send(JSON.stringify(message));
  }

  sendBinary(data: Buffer) {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      logger.debug("Web socket not open. Message not sent.", {
        name: this.name,
      });
      return;
    }

    this.ws.send(data, { binary: true });
  }

  close() {
    if (this.ws) {
      try {
        this.isAuthenticated = false;
        this.ws.removeAllListeners();
        if (this.ws.readyState !== WebSocket.CLOSING) {
          this.ws.close();
        }
        this.ws = null;
      } catch(err){
        logger.error("Error closing web socket", err);
      }
    }
  }

  private handleJsonMessage(data: WebSocket.Data) {
    const message: { type: string; target: string; data: Buffer } = JSON.parse(
      data.toString(),
    );

    if (message.target !== this.name) {
      logger.debug("WS message received for a different target. Ignoring...", {
        name: this.name,
        target: message.target,
      });
      return;
    }

    if (!this.isAuthenticated && message.type !== "authentication-succeeded") {
      logger.debug("Web socket is not authenticated. Ignoring message", {
        type: message.type,
      });
      return;
    }

    logger.silly("Handling web socket json message", {
      type: message?.type,
      target: message?.target,
    });

    const handlers = this.jsonHandlers[message.type];
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }
  }

  handleBinaryMessage(data: WebSocket.Data) {
    if (!this.isAuthenticated) {
      logger.debug("Web socket is not authenticated. Ignoring binary message");
      return;
    }

    const length =
      data instanceof Buffer || data instanceof ArrayBuffer
        ? data.byteLength
        : data.length;
    logger.silly("Handling web socket binary message", { length });

    this.binaryHandlers.forEach((handler) => handler(data));
  }
}
