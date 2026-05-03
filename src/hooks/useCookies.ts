import Cookies from "js-cookie";

export const setCookies = function (name?: any, value?: any, expires?: number) {
  Cookies.set(name, value, {
    expires: expires,
    secure: true,
    sameSite: "Strict",
  });
};

export const getCookies = function (name: string): any {
  return Cookies.get(name);
};

export const removeCookies = function (name: string): void {
  Cookies.remove(name);
};