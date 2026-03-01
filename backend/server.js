import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import chatRoutes from "./routes/chatRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

const configuredOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const localOriginPatterns = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];

const allowedOrigins = [...configuredOrigins, ...localOriginPatterns];

const corsOrigin = configuredOrigins.length > 0 ? allowedOrigins : true;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/chat", chatRoutes);

app.use((error, _req, res, next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      error: "Uploaded image is too large. Please upload a smaller image.",
    });
  }

  return next(error);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});