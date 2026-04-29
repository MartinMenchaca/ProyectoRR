import { Router } from "express";
import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "backend",
    database: env.databaseFile,
    timestamp: new Date().toISOString()
  });
});
