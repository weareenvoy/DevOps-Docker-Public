// eslint-disable-next-line @typescript-eslint/no-var-requires
const dgram = require("dgram");

import { UDP_SEND_HOST, UDP_SEND_PORT } from "./config";
import { logger } from "./logger";

const udpClient = dgram.createSocket("udp4");

export const sendUdp = (data: ArrayBuffer | Buffer | string) => {
  const buffer = data instanceof Buffer ? data : Buffer.from(data);

  udpClient.send(
    buffer,
    0,
    buffer.length,
    UDP_SEND_PORT,
    UDP_SEND_HOST,

    function (err: any) {
      if (err) {
        logger.error("Error forwarding UDP message to data channel", err);
      } else {
        logger.silly("Data channel message forwarded to UDP");
      }
    },
  );
};
