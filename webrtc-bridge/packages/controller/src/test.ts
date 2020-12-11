// eslint-disable-next-line @typescript-eslint/no-var-requires
const wrtc: any = require("wrtc");

import { logger } from "./logger";

(() => {
  const connection = new wrtc.RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    sdpSemantics: "unified-plan",
  });

  const remote = new wrtc.RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    sdpSemantics: "unified-plan",
  });

  connection.onicecandidate = async (event: { candidate: any }) => {
    const { candidate } = event;
    if (candidate) {
      await remote.addIceCandidate(candidate);
    }
  };

  remote.onicecandidate = async (event: { candidate: any }) => {
    const { candidate } = event;
    if (candidate) {
      await connection.addIceCandidate(candidate);
    }
  };

  const onopen = () => {
    logger.info("Data channel open");
  };

  const onmessage = (message: Buffer) => {
    logger.info("Message received", message.toString());
  };

  remote.ondatachannel = (event: any) => {
    event.channel.onopen = onopen;
    event.channel.onmessage = onmessage;
  };

  const dc = connection.createDataChannel();
  dc.onopen = onopen;
  dc.onmessage = onmessage;

  connection.onnegotiationneeded = async () => {
    logger.debug("Beginning connection negotiation...");

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    await remote.setRemoteDescription(offer);

    const answer = await remote.createAnswer();
    await remote.setLocalDescription(answer);
    await connection.setRemoteDescription(answer);
  };

  setInterval(() => {
    dc.send(JSON.stringify({ ping: new Date().toISOString() }));
  }, 5000);

  setInterval(() => {
    dc.send(JSON.stringify({ ping: new Date().toISOString() }));
  }, 5000);
})();
