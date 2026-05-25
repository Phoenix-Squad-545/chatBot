"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const envKeys_1 = require("../constants/envKeys");
const generateAccessToken = (payload, expiresIn = "15m") => {
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, envKeys_1.ACCESS_TOKEN_SECRET, options);
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload, expiresIn = "7d") => {
    const options = { expiresIn };
    return jsonwebtoken_1.default.sign(payload, envKeys_1.REFRESH_TOKEN_SECRET, options);
};
exports.generateRefreshToken = generateRefreshToken;
