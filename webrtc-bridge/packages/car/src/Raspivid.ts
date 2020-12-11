// This file is a combination of the npm packages raspivid and raspivid-stream.

import { spawn, ChildProcessByStdio } from "child_process";
import { Readable } from "stream";
const Splitter = require('stream-split');

export class Raspivid {
  static readonly NALseparator = new Buffer([0, 0, 0, 1]);

  private readonly args: string[];

  private raspividProcess: ChildProcessByStdio<
    null,
    Readable,
    null
  > | null = null;

  constructor(options: { [key: string]: any }) {
    this.args = this.getArgs(options);
  }

  start() {
    if (this.raspividProcess) {
      this.stop();
    }

    this.raspividProcess = spawn("raspivid", this.args, {
      stdio: ["ignore", "pipe", "inherit"],
    });

    return this.raspividProcess.stdout.pipe(new Splitter(Raspivid.NALseparator));
  }

  stop() {
    if (this.raspividProcess) {
      this.raspividProcess.stdout.removeAllListeners();
      this.raspividProcess.kill("SIGINT");
      this.raspividProcess = null;
    }
  }

  private getArgs(options: { [key: string]: any }) {
    const args = ["--nopreview", "--output", "-", "--timeout", "0"];

    Object.keys(options).forEach(function (key) {
      args.push("--" + key);
      const val = options[key];
      if (val || val === 0) {
        args.push(val);
      }
    });

    return args;
  }
}
