import { removeCookies } from "../hooks/useCookies";

export const logoutUser = () => {
  removeCookies("accessToken");
  removeCookies("refreshToken");
  removeCookies("tokenType");
  window.location.href = "/";
};

