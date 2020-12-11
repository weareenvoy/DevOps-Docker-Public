import * as express from "express";

import { addToRequestLog } from "./logRequest";
import { sendError } from "./sendError";

export const handleUncaughtError = (): express.ErrorRequestHandler => (
  err,
  req,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next,
) => {
  addToRequestLog(res, err, "error");
  sendError(res, err);
};
