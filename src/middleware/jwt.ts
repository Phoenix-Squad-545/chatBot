import jwt, { SignOptions } from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../constants/envKeys";

export interface JwtPayload {
  id: string;
  email?: string;
  role?: string;
}

export const generateAccessToken = (
  payload: JwtPayload,
  expiresIn: any = "15m"
): string => {
  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

export const generateRefreshToken = (
  payload: JwtPayload,
  expiresIn: any = "7d"
): string => {
  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};
