import * as express from "express";

export const handle404 = (): express.Handler => (req, res) => {
  res.status(404).send();
};
