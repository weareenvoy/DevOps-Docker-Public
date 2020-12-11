import { config as loadDotEnvFile } from "dotenv";
loadDotEnvFile();

import * as cleanup from 'node-cleanup';

import { Raspivid } from './Raspivid';

import { BRIDGE_SERVER_URL, UDP_RECEIVE_PORT } from "./config";
import { sendUdp } from "./sendUdp";
import { startUdpServer } from "./startUdpServer";
import { logger } from "./logger";
import { WebSocketWrapper } from "./WebSocketWrapper";

const settings: { [key: string]: any } = {
  width: 1280,
  height: 720,
  framerate: 30,
  profile: "baseline",
  roi: ".25,.25,.5,.5",
  brightness: 50,
};

let forwarded = 0;
let skipped = 0;
let bufferSize = 0;
let toBridge = 0;
let toLocalhost = 0;
setInterval(() => {
  logger.debug("Stats", {
    frames: { forwarded, skipped, bufferSize },
    udp: { toBridge, toLocalhost },
  });
}, 5000);

const wsUrl = BRIDGE_SERVER_URL.replace("http", "ws");
const ws = new WebSocketWrapper("car", wsUrl);


ws.onAuthenticated(() => {
  logger.info("Sending video-settings...", settings);
  ws.sendJson({ type: "video-settings", settings });
})

ws.onJson("udp-packet", (message) => {
  toLocalhost++;
  sendUdp(message.data as Buffer);

  if (logger.isSillyEnabled()) {
    logger.silly("UDP message received from bridge", {
      data: (message.data as Buffer).toString(),
    });
  }
})

const raspivid = new Raspivid(settings);
ws.onJson("start-video", () => {
  logger.info('Video restart requested...')
  const videoStream = raspivid.start();
  
  const send = (buffer: Buffer) => {
    bufferSize = ws.bufferedAmount;
    forwarded++;
    ws.sendBinary(Buffer.concat([Raspivid.NALseparator, buffer]))
  };


  videoStream.on("data", send);

  logger.info('Video stream started')
})

ws.onJson('stop-video', () => {
  logger.info('Video stop requested...');
  raspivid.stop();
});

ws.connect();

const udpServer = startUdpServer({
  port: UDP_RECEIVE_PORT,

  onMessageReceived: (buffer) => {
    try {
      ws.sendJson({ type: "udp-packet", target: "controller", data: buffer });

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

cleanup((exitCode, signal) => {
  try {
    logger.info('Stopping app', { exitCode, signal });

    udpServer.close();
    logger.info('UDP server closed');

    ws.close();
    logger.info('Web socket closed');
    
    raspivid.stop();
    logger.info('Raspivid stopped');

  } catch(err) {
    logger.error("Error stopping app", err);
  }
})