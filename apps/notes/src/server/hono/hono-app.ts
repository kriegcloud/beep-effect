import { Hono } from "hono";

import { aiRoutes } from "./routes/ai";
import { authRoutes } from "./routes/auth";
import { exportRoutes } from "./routes/export";

export const app = new Hono()
  .basePath("/api")
  .route("/auth", authRoutes)
  .route("/ai", aiRoutes)
  .route("/export", exportRoutes);
