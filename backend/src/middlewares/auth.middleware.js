import jwt from "jsonwebtoken";
import env from "../config/env.js";
import AppError from "./AppError.js";
import authRepository from "../models/auth/auth.repository.js";
import redis from "../config/redis.js";

const USER_CACHE_TTL = 60 * 60; // 1 hour

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Redis first
    const cacheKey = `user:${decoded.userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      req.user = JSON.parse(cached);
      return next();
    }

    // cache miss — DB se fetch
    const user = await authRepository.findUserById(decoded.userId);
    if (!user) throw new AppError("User no longer exists", 401);

    // Redis mein store
    await redis.setEx(cacheKey, USER_CACHE_TTL, JSON.stringify(user));

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired", 401));
    }
    next(error);
  }
};

export default authenticate;
