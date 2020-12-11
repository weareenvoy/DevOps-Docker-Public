import * as express from "express";
import * as uaParser from "ua-parser-js";

export type LogMethod = (level: string, message: string, meta?: {}) => void;

export const logLevels = [
  "silly",
  "verbose",
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "critical",
  "fatal",
];

export const addToRequestLog = (
  res: express.Response,
  data: {},
  level?: string,
) => {
  const log = res.locals?.log || {};
  log.data = log.data || [];
  log.data.push(data);

  if (level && logLevels.indexOf(log.level) < logLevels.indexOf(level)) {
    log.level = level;
  }
};

export const logRequest = (logMethod: LogMethod): express.Handler => (
  req,
  res,
  next,
) => {
  const { browser, os, device } = new uaParser.UAParser(
    req.headers["user-agent"],
  ).getResult();

  const start = new Date().valueOf();

  res.locals.log = {
    ...res.app.locals?.logData,
    level: "info",
    method: req.method,
    path: req.path.substr(0, 1024),
    query: req.query as any,
    ip: req.ip,
    ua: { browser, os, device },
    activityId: res.locals.activityId,
    data: [],
  };

  res.on("finish", () => {
    const log = res.locals.log;

    log.status = res.statusCode;
    log.duration = new Date().valueOf() - start;

    if (
      500 <= log.status &&
      logLevels.indexOf(log.level) < logLevels.indexOf("error")
    ) {
      log.level = "error";
    }

    logMethod(log.level, `${res.statusCode}`, log);
  });

  next();
};
