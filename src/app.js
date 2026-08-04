import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import compression from "compression";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";
import errorMiddleware from "./middlewares/error.js";

const app = express();

// 1. CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://10.10.13.30:3000",
  "http://localhost:4000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("http://192.168.") ||
        origin.startsWith("http://10.")
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
  }),
);

// Body parser & cookies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(compression());

// Rate limiting (in-memory, no Redis)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: "Too many login attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ─────────────────────────────────────────────────────────

// Auth routes (with rate limiting)
app.use("/auth", authLimiter, authRoutes);

// Chat/messaging routes
app.use("/msg", messageRoutes);

// Public API routes (Django-compatible, no auth needed)
// These are the routes the frontend portfolio uses
app.use("/api", publicRoutes);

// Also mount profile at /profile for backward compat with dashboard
app.use("/profile", publicRoutes);

// Admin/Dashboard API routes (no backend auth — dashboard uses its own simple auth)
app.use("/admin", adminRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Portfolio Backend API" });
});

// Handle 404 - Not Found
app.use((req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.status = 404;
  err.functionName = "unknownRoute";
  err.flow = "Routing";
  next(err);
});

// Error handling middleware should be last
app.use(errorMiddleware);

export default app;
