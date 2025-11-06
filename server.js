import express from "express";
import dotenv from 'dotenv';
import logger from "./libs/logger.js";
import cookieParser from "cookie-parser";
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import meRoute from "./routes/meRoute.js";
import validateJsonBodyMiddleware from "./middlewares/validateJsonBodyMiddleware.js";
import authMiddleware from "./middlewares/authMiddleware.js";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 443;
const app = express();

// Public route: 10 requests / minute
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 10,
  standardHeaders: true, // gửi X-RateLimit-* headers
  legacyHeaders: false,  // bỏ X-RateLimit-* kiểu cũ
  message: {
    message: 'Ban da gui request qua nhieu.',
    code: 7
  },
});

// Private route: 50 requests / minute
const privateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Ban da gui request qua nhieu.',
    code: 7
  },
});

// Middlewares

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use(validateJsonBodyMiddleware);

// Public routes

app.use('/auth', publicLimiter, authRoute);

// Private routes
app.use(authMiddleware);

app.use('/me', privateLimiter, meRoute);

connectDB()
  .then(() => {
    app.listen(PORT, (err) => {
      if (err) {
        return logger('error', 'Khong the khoi tao server, error:', err);
      }
      logger('info', `Khoi tao server thanh cong tai port: ${PORT}`);
    })
  })