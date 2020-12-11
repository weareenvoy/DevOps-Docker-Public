import * as dgram from "dgram";

import { logger } from "./logger";

const DEFAULT_HOST = "0.0.0.0";

export const startUdpServer = (options: {
  host?: string;
  port: number;
  onMessageReceived: (msg: Buffer, rinfo: dgram.RemoteInfo) => void;
}) => {
  const server = dgram.createSocket("udp4");

  server.on("listening", function () {
    const address = server.address();
    logger.info(
      "UDP Server listening on " + address.address + ":" + address.port,
      { startedAt: new Date() },
    );
  });

  server.on("error", (err) => {
    logger.error('Error in UDP server', err);
  });

  server.on("close", () => {
    logger.error('UDP server closed.');
  });

  server.on("message", options.onMessageReceived);

  server.bind(options.port, options.host || DEFAULT_HOST);

  return server;
};
