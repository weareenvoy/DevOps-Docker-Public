// eslint-disable-next-line @typescript-eslint/no-var-requires
const wrtc: any = require("wrtc");
import { TextDecoder } from "util";

import { logger } from "./logger";

export class RtcConnection {
  socket: any;
  name: string;
  target: string;
  stream?: any;
  dataHandlers: { onopen?: Function; onmessage: Function };

  connection: any = null; // RTCPeerConnection
  dataChannel: any = null; // RTCDataChannel

  constructor(
    socket: any,
    options: {
      name: string;
      target: string;
      stream?: any;
      dataHandlers: { onopen?: Function; onmessage: Function };
    },
  ) {
    this.socket = socket;
    this.name = options.name;
    this.target = options.target;
    this.stream = options.stream;
    this.dataHandlers = options.dataHandlers;
  }

  sendOffer() {
    try {
      logger.info("Sending connection offer...", {
        name: this.name,
        target: this.target,
      });

      this.reset(true);

      this.connection.onnegotiationneeded = async () => {
        logger.debug("Beginning connection negotiation...", {
          name: this.name,
          target: this.target,
        });

        try {
          const offer = await this.connection.createOffer();

          if (this.connection.signalingState !== "stable") {
            logger.silly("Connection not yet stable - negotiation postponed", {
              name: this.name,
              target: this.target,
            });
            return;
          }

          logger.silly(
            "Setting local description (initiates ICE candidate gathering)...",
            { name: this.name, target: this.target },
          );
          await this.connection.setLocalDescription(offer);

          this.socket.on(
            "connection-answer",
            async (data: { target: string; answer: {} }) => {
              try {
                const { target, answer } = data;
                if (target !== this.name) {
                  return;
                }

                logger.info("Connection answer received", {
                  name: this.name,
                  target: this.target,
                });
                logger.debug("Connection answer data", {
                  name: this.name,
                  target: this.target,
                  answer,
                });

                await this.connection.setRemoteDescription(answer);
              } catch (err) {
                logger.error("Error handling connection answer", {
                  name: this.name,
                  target: this.target,
                  err,
                });
                this.reset(true);
              }
            },
          );

          logger.debug("Sending connection-offer message...", {
            name: this.name,
            target: this.target,
          });
          this.socket.emit("connection-offer", {
            target: this.target,
            offer: this.connection.localDescription,
          });
        } catch (err) {
          logger.error("Error negotiating connection", {
            name: this.name,
            target: this.target,
            err,
          });
          this.reset(true);
        }
      };

      this.socket.on(
        "awaiting-connection-offer",
        async (data: { target: string; offer: {} }) => {
          logger.info("Awaiting offer received....", {
            name: this.name,
            target: this.target,
          });

          this.sendOffer();
        },
      );
    } catch (err) {
      logger.error("Error sending offer", {
        name: this.name,
        target: this.target,
        err,
      });
      this.reset(true);
    }
  }

  awaitOffer() {
    try {
      logger.info("Awaiting connection offer...", {
        name: this.name,
        target: this.target,
      });

      this.reset(false);

      this.socket.on(
        "connection-offer",
        async (data: { target: string; offer: {} }) => {
          try {
            const { target, offer } = data;
            if (target !== this.name) {
              return;
            }

            logger.debug("Connection offer received", {
              name: this.name,
              target: this.target,
              offer,
            });

            this.reset(false);

            if (this.connection.signalingState !== "stable") {
              logger.debug(
                "Connection not yet stable - negotiation postponed",
                { name: this.name, target: this.target },
              );
              return;
            }

            const sdp = new wrtc.RTCSessionDescription(offer);
            await this.connection.setRemoteDescription(sdp);
            const answer = await this.connection.createAnswer();
            await this.connection.setLocalDescription(answer);

            this.socket.emit("connection-answer", {
              target: this.target,
              answer,
            });

            logger.debug("Connection answer sent", {
              name: this.name,
              target: this.target,
              answer,
            });
          } catch (err) {
            logger.error("Error answering offer", {
              name: this.name,
              target: this.target,
              err,
            });
            this.reset(false);
          }
        },
      );

      logger.debug("Sending awaiting-connection-offer...", {
        name: this.name,
        target: this.target,
      });

      this.socket.emit("awaiting-connection-offer", {
        name: this.name,
        target: this.target,
      });
    } catch (err) {
      logger.error("Error awaiting connection offer", {
        name: this.name,
        target: this.target,
        err,
      });
      this.reset(false);
    }
  }

  close() {
    try {
      if (this.connection) {
        this.connection.ontrack = null;
        this.connection.onnicecandidate = null;
        this.connection.oniceconnectionstatechange = null;
        this.connection.onsignalingstatechange = null;
        this.connection.onicegatheringstatechange = null;
        this.connection.onnegotiationneeded = null;

        this.connection.close();
        this.connection = null;
      }
    } catch (err) {
      logger.error("Error closing connection", {
        name: this.name,
        target: this.target,
        err,
      });
    }
  }

  reset(createDataChannel: boolean) {
    this.close();

    this.connection = new wrtc.RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      sdpSemantics: "unified-plan",
    });

    if (createDataChannel) {
      this.dataChannel = this.connection.createDataChannel();
      this.attachDataChannelHandlers(this.dataChannel);
    } else {
      this.connection.ondatachannel = (event: any) => {
        logger.info("Data channel received.", {
          name: this.name,
          target: this.target,
          event,
        });
        this.dataChannel = event.channel;
        this.attachDataChannelHandlers(this.dataChannel);
      };
    }

    if (this.stream) {
      try {
        logger.info("Adding video track", this.stream);
        const videoSource = new wrtc.nonstandard.RTCVideoSource();
        const track = videoSource.createTrack();
        this.connection.addTrack(track);

        const totalFrameBytes = 1280 * 720 * 1.5;
        this.stream.on("data", (buffer: Buffer) => {
          // logger.silly("buffer", {
          //   byteLength: buffer.byteLength,
          //   firstBytes: buffer.slice(0, 16),
          // });

          let frameBuffer: Buffer;
          if (buffer.byteLength < totalFrameBytes) {
            const frameBytes: Uint8Array = new Uint8Array(totalFrameBytes);
            frameBuffer = Buffer.from(frameBytes);
          } else if (buffer.byteLength === totalFrameBytes) {
            frameBuffer = buffer;
          } else {
            logger.error("Video frame data too large. Dropping data.");
            return;
          }

          videoSource.onFrame({
            width: 1280,
            height: 720,
            data: new Uint8Array(frameBuffer),
          });
        });
      } catch (err) {
        logger.error("Error adding video track", err);
        this.reset(createDataChannel);
      }
    }

    this.socket.on(
      "new-ice-candidate",
      async (data: { target: string; candidate: any }) => {
        try {
          const { target, candidate } = data;
          if (target !== this.name) {
            return;
          }

          logger.silly("Remote ICE candidate received", {
            name: this.name,
            target: this.target,
            data,
          });

          await this.connection.addIceCandidate(candidate);
        } catch (err) {
          logger.error("Error adding remote ICE candidate", {
            name: this.name,
            target: this.target,
            err,
            data,
          });
          this.reset(createDataChannel);
        }
      },
    );

    this.connection.onicecandidate = (event: { candidate: any }) => {
      try {
        const { candidate } = event;
        if (candidate) {
          logger.silly("Sending new-ice-candidate", {
            name: this.name,
            target: this.target,
            candidate,
          });
          this.socket.emit("new-ice-candidate", {
            target: this.target,
            candidate,
          });
        }
      } catch (err) {
        logger.error("Error sending ICE candidate", {
          name: this.name,
          target: this.target,
          err,
        });
        this.reset(createDataChannel);
      }
    };

    this.connection.oniceconnectionstatechange = () => {
      try {
        const { iceConnectionState } = this.connection;
        logger.silly("ICE connection state changed", {
          name: this.name,
          target: this.target,
          iceConnectionState,
        });

        // switch (iceConnectionState) {
        //   case "closed":
        //   case "failed":
        //   case "disconnected":
        //     this.close();
        //     break;
        // }
      } catch (err) {
        logger.error("Error on ICE connection state change", {
          name: this.name,
          target: this.target,
          err,
        });
      }
    };

    this.connection.onicegatheringstatechange = () => {
      const { iceGatheringState } = this.connection;
      logger.silly("ICE gathering state changed", {
        name: this.name,
        target: this.target,
        iceGatheringState,
      });
    };

    this.connection.onsignalingstatechange = () => {
      try {
        const { signalingState } = this.connection;
        logger.silly("Signaling state changed", {
          name: this.name,
          target: this.target,
          signalingState,
        });

        // switch (this.connection.signalingState) {
        //   case "closed":
        //     this.close();
        //     break;
        // }
      } catch (err) {
        logger.error("Error on signaling state change", {
          name: this.name,
          target: this.target,
          err,
        });
      }
    };

    this.connection.onconnectionstatechange = () => {
      try {
        const { connectionState } = this.connection;
        logger.debug("Peer connection state changed", {
          name: this.name,
          target: this.target,
          connectionState,
        });

        switch (this.connection.connectionState) {
          case "failed":
          case "disconnected":
          case "closed":
            this.reset(createDataChannel);
            break;
        }
      } catch (err) {
        logger.error("Error on connection state change", {
          name: this.name,
          target: this.target,
          err,
        });
      }
    };
  }

  sendData(data: {}) {
    try {
      if (this.dataChannel && this.dataChannel.readyState === "open") {
        this.dataChannel.send(data);
        if (logger.isDebugEnabled()) {
          logger.silly("Data channel message sent", {
            name: this.name,
            target: this.target,
            data: this.coerceToString(data),
          });
        }
      } else {
        logger.warn("Data channel not open. No data sent.");
      }
    } catch (err) {
      logger.error("Error sending data", {
        name: this.name,
        target: this.target,
        err,
      });
    }
  }

  private attachDataChannelHandlers(channel: any) {
    channel.onopen = (event: any) => {
      try {
        if (this.dataHandlers.onopen) {
          this.dataHandlers.onopen(event);
        }
        logger.info("Data channel opened", {
          name: this.name,
          target: this.target,
        });
      } catch (err) {
        logger.error("Error in onopen handler", {
          name: this.name,
          target: this.target,
          err,
        });
      }
    };

    channel.onmessage = (event: any) => {
      try {
        this.dataHandlers.onmessage(event);
        if (logger.isSillyEnabled()) {
          const data = this.coerceToString(event.data);
          logger.silly("Data channel message handled", {
            name: this.name,
            target: this.target,
            data,
          });
        }
      } catch (err) {
        logger.error("Error in onmessage handler", {
          name: this.name,
          target: this.target,
          err,
        });
      }
    };

    channel.onerror = (err: any) => {
      logger.error("Error in data channel", {
        name: this.name,
        target: this.target,
        err,
      });
    };

    channel.onclose = () => {
      logger.error("Data channel closed", {
        name: this.name,
        target: this.target,
      });
    };
  }

  private coerceToString(value: ArrayBuffer | Buffer | {} | string) {
    if (value instanceof ArrayBuffer) {
      return new TextDecoder("utf-8").decode(value);
    }

    if (value instanceof Buffer) {
      return value.toString();
    }

    if (value instanceof Object) {
      return JSON.stringify(value);
    }

    return value;
  }
}
