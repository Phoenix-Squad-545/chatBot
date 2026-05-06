import { Get, Post } from "../api/apiService";
import { AISCREENNING_API, API, CHAT_API } from "../api/endPoint";

export const loginService = (data: any) => {
  return Post({ url: API.POST_LOGIN, payload: data });
};

export const RefreshTokenAPI = (data: any) => {
  return Post({ url: API.POST_REFRESH_TOKEN, payload: data });
};
export const ChatAPI = (data: any) => {
  return Post({ url: CHAT_API.POST_CHAT, payload: data });
};


export const AiScreeningUpload = (data: any, contentType: string) => {
  return Post({ url: AISCREENNING_API.POST_AISCREENNING, payload: data }, contentType);
};
