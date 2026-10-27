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
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Stripe webhook
app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Clerk webhook
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// Normal middleware
app.use(express.json());

// Test route & Health check for Render (Never blocked by auth)
app.get("/", (req, res) => res.json({ status: "ok", message: "Hotel Pro API is working", uptime: process.uptime() }));
app.get("/health", (req, res) => res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() }));

// Public routes (Always accessible)
app.use("/api/rooms", roomRouter);
app.use("/api/hotels", hotelRouter);

// Clerk middleware: only runs if BOTH keys are present
if (process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY) {
  app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  }));
} else {
  console.log("ℹ️  Clerk keys not provided - Auth bypassed for demo.");
}

// Protected routes
app.use("/api/user", userRouter);
app.use("/api/bookings", bookingRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
