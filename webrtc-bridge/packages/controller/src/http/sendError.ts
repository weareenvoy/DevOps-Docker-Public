import * as express from "express";

export const sendError = (
  res: express.Response,
  error: { name: string; message: string; statusCode?: number },
  headers: any = {},
) => {
  res.statusCode = error.statusCode || 500;
  res.set(headers);
  res.json(error);
};
