
// implement without refresh token need to check

// import axios from "axios";
// import Cookies from "js-cookie";
// import { getCookies } from "../hooks/useCookies";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
// });

// // Attach token from cookies
// axiosInstance.interceptors.request.use(config => {
//    const token = getCookies("accessToken");

//   if (token) {
//     config.headers["Authorization"] = `Bearer ${token}`;
//   }

//   return config;
// });

// export default axiosInstance;

// /--------------------------------------------------------------------/

// implement with refresh token need to check

import axios from "axios";
import { getCookies } from "../hooks/useCookies";
import { refreshAccessToken } from "../api/refreshTokenService";
import { logoutUser } from "../helper/data";
import { notifyError } from "../helper/toaster";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔹 REQUEST: attach access token
axiosInstance.interceptors.request.use(config => {
   const token = getCookies("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

    // 🔥 ngrok header only when needed
    if (import.meta.env.VITE_USE_NGROK === "true") {
      config.headers["ngrok-skip-browser-warning"] = "1";
    }

  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  // console.log(error,"ProcessQueue");
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

// 🔹 RESPONSE: handle 401
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
console.log(error.response,"error.response>>>");

   // 🌐 No internet / network error
   if (!error.response) {
    notifyError("No internet connection. Please check your network.");
    return Promise.reject(error);
  }
    // 🔁 Try refresh only once when access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If refresh already running, queue request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🔐 Call refresh API using refresh token
        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) throw new Error("No token from refresh API");
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.log(err,"Cache Error");
        processQueue(err, null);
        // ❌ Only now logout (refresh token expired/invalid)
        notifyError("Session expired. Please login again.");
        // setTimeout(() => {
          logoutUser();
        // }, 1000); 
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    else {
      console.log(error,"elseerror>>>>");
    }

      // 🔴 500 – Server error
      if (error.response?.status >= 500) {
        notifyError("Something went wrong. Please try again later.");
      }

    return Promise.reject(error);
  }
);

export default axiosInstance;
