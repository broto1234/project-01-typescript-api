import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

export default healthRouter;

//process.uptime() returns the actual number of seconds your Node.js process has been running.
//process.env.NODE_ENV automatically reports whether you're running in "development", "production", or "test".