import { Get, Post } from "../api/apiService";
import { CAR_API, CATEGORY_LIST_API, FLIGHT_API, HOTELS_API } from "../api/endPoint";

export const CategoryListAPI = () => {
  return Post({ url: CATEGORY_LIST_API.POST_CATEGORY_LIST, payload: { "email":"krish@gmail.com"} });
};

export const FlightListAPI = () => {
  return Get({ url: FLIGHT_API.GET_FLIGHTS,});
};

export const FlightDetailsAPI = (data: any) => {
  return Post({ url: FLIGHT_API.POST_FLIGHTS_DETAILS, payload: data });
};

export const HotelsListAPI = () => {
  return Get({ url: HOTELS_API.GET_HOTELS,});
};

export const HotelsDetailsAPI = (data: any) => {
  return Post({ url: HOTELS_API.POST_HOTELS_DETAILS, payload: data });
};

export const CarListAPI = () => {
  return Get({ url: CAR_API.GET_CARS,});
};

export const CarDetailsAPI = (data: any) => {
  return Post({ url: CAR_API.POST_CARS_DETAILS, payload: data });
};

