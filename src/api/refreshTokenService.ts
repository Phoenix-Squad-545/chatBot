// services/authService.ts
import axios from "axios";
import { getCookies, setCookies } from "../hooks/useCookies";
import { API } from "./endPoint";

const API_URL = import.meta.env.VITE_API_URL;

export const refreshAccessToken = async () => {
  const refreshToken = getCookies("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const response = await axios.post(
    `${API_URL}${API.POST_REFRESH_TOKEN}`,
    { refreshToken }
  );

  const { accessToken, refreshToken: newRefreshToken, tokenType } =
    response.data.data;

  // save new tokens
  setCookies("accessToken", accessToken, 1); // 1 day
  setCookies("refreshToken", newRefreshToken, 7); // 7 days
  setCookies("tokenType", tokenType, 7);

  return accessToken;
};
