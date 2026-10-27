import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";

import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";
import connectCloudinary from "./configs/cloudinary.js";
import initRedis from "./configs/redis.js";

connectDB();
connectCloudinary();
initRedis();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'https://quickstay-nu-nine.vercel.app',
  'https://hotel-booking-frontend-jsxm.onrender.com'
].filter(Boolean);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin, localhosts, or Render / Vercel deployments
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback to allow during development and demo deployment
      }
    },
    credentials: true,
  })
);

// Stripe webhook
app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Clerk webhook
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// Normal middleware
app.use(express.json());

// Clerk middleware AFTER webhook routes
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

// Test route & Health check for Render
app.get("/", (req, res) => res.json({ status: "ok", message: "Hotel Pro API is working", uptime: process.uptime() }));
app.get("/health", (req, res) => res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() }));

// Startup checks
console.log("CLERK_PUBLISHABLE_KEY:", process.env.CLERK_PUBLISHABLE_KEY ? "Loaded" : "Not Found");
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "Loaded" : "Not Found");
console.log("CLERK_WEBHOOK_SECRET:", process.env.CLERK_WEBHOOK_SECRET ? "Loaded" : "Not Found");

// Public routes
app.use("/api/rooms", roomRouter);
app.use("/api/hotels", hotelRouter);

// Protected routes
app.use("/api/user", userRouter);
app.use("/api/bookings", bookingRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);