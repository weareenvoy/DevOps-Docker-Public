import * as express from "express";
import * as cors from "cors";
import * as helmet from "helmet";
import * as compression from "compression";
import * as bodyParser from "body-parser";

import { requireHttps } from "./requireHttps";
import { handle404 } from "./handle404";
import { handleUncaughtError } from "./handleUncaughtError";

export const createApp = (addRoutes: (app: express.Application) => void) => {
  const app = express();

  app.enable("trust proxy");

  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(requireHttps());
  app.use(bodyParser.json());

  addRoutes(app);

  app.use(handle404());
  app.use(handleUncaughtError());

  return app;
};
