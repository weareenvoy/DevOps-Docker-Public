import * as http from "http";
import * as express from "express";

import { logger } from "../logger";
import { createApp } from "./createApp";

export const createHttpServer = (
  addRoutes: (app: express.Application) => void,
) => {
  const app = createApp(addRoutes);

  const server = http.createServer(app);

  return server;
};
