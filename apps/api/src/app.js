import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import apiRoutes from "./routes/index.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { Sentry } from "./lib/sentry.js";

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: 0
});

const app = express();

const allowedOrigins = new Set(
  [process.env.CLIENT_URL, process.env.CLIENT_URLS]
    .filter(Boolean)
    .flatMap((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
);

if (!allowedOrigins.size) {
  allowedOrigins.add("http://localhost:5173");
}

const vercelPreviewOriginPattern = /^https:\/\/health-care-appointment-booking-(system|sys)(-[a-z0-9]+)?\.vercel\.app$/;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  return vercelPreviewOriginPattern.test(origin);
}

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/health", (_req, res) => {
  res.set("Cache-Control", "no-store, max-age=0");
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use((req, res, next) => {
  if (req.method === "GET" && req.path.startsWith("/api/v1/doctor-profile")) {
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  } else if (req.method === "GET" && req.path.startsWith("/api/v1/availability")) {
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
  } else if (req.path.startsWith("/api/")) {
    res.set("Cache-Control", "no-store, max-age=0");
  }

  next();
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
