"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPEN_AI_API_KEY = exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.DB_URL = exports.APP_PORT = void 0;
exports.APP_PORT = process.env.APP_PORT || 3000;
exports.DB_URL = process.env.DB_URL || "";
exports.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "your_secret_key";
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your_refresh_secret";
exports.OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY || "";
