import { notifyError } from "../helper/toaster";
import axiosInstance from "./axioInstance";

export interface InputData {
  payload?: any;
  header?: any;
  url: string;
}

const handleError = (error: any) => {
  // Means no response came from backend → Network error, CORS, server down, timeout
   console.log(error,"error");

  if (error.response?.status === 401) {
    notifyError("Token Invalid")
  }
  if (error.response?.status === 500) {
    console.warn("Internal Server Error or SomeThing Went Wrong...")
    notifyError("Internal Server Error or SomeThing Went Wrong...")
  }

  if (!error.response) {
    return {
      status: false,
      message: "Network error. Please check your internet connection.",
    };
  }
  if (error.response) {
    return error.response.data;
  }
  return {
    message: error.message,
    status: false,
  };
};

export async function Get({ url }: InputData) {
  try {
    const res = await axiosInstance.get(url);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
}

export async function Post(
  { url, payload }: InputData,
  contentType: string = "application/json"
) {
  try {
    const headers: any = {
      "Content-Type":
        contentType === "multipart/form-data"
          ? "multipart/form-data"
          : "application/json",
    };

    const res = await axiosInstance.post(url, payload, { headers });
    return res.data;
  } catch (error) {
    return handleError(error);
  }
}

export async function Put(
  { url, payload }: InputData,
  contentType: string = "application/json"
) {
  try {
    const headers: any = {
      "Content-Type":
        contentType === "multipart/form-data"
          ? "multipart/form-data"
          : "application/json",
    };

    const res = await axiosInstance.put(url, payload, { headers });
    return res.data;
  } catch (error) {
    return handleError(error);
  }
}

export async function Delete(
  { url, payload }: InputData,
  contentType: string = "application/json"
) {
  try {
    const headers: any = {
      "Content-Type":
        contentType === "multipart/form-data"
          ? "multipart/form-data"
          : "application/json",
    };

    const res = await axiosInstance.delete(url, {
      data: payload,
      headers,
    });
    return res.data;
  } catch (error) {
    return handleError(error);
  }
}
