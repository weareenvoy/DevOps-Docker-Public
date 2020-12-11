import * as express from "express";

import { sendError } from "./sendError";

export const requireHttps = (
  options = { allowInsecure: ["localhost"] },
): express.Handler => (req, res, next) => {
  if (
    req.headers["x-forwarded-proto"] === "https" ||
    req.secure ||
    options.allowInsecure.includes(req.hostname)
  ) {
    next();
  } else {
    if (req.method === "GET") {
      res.redirect(301, "https://" + req.host + req.originalUrl);
    } else {
      sendError(res, {
        name: "BadRequest",
        statusCode: 400,
        message:
          "This endpoint accepts only secure requests. Retry using https.",
      });
    }
  }
};
