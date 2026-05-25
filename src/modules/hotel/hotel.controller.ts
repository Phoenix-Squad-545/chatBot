import { Request, Response } from "express";
import {
  BAD_REQUEST_CODE,
  CREATED_DOC_CODE,
  SUCCESS_CODE,
} from "../../constants/statusCode";
import { HotelSchema } from "./hotel.model";
import {
  HOTEL_CREATE_FAILED_MSG,
  HOTEL_CREATE_SUCCESS_MSG,
  HOTEL_LIST_GET_SUCCESS_MSG,
} from "../../constants/message";

export const createNewHotelCategory = async (req: Request, res: Response) => {
  try {
    const hotel = await HotelSchema.create(req.body);

    if (!hotel) {
      res.status(BAD_REQUEST_CODE).json({ message: HOTEL_CREATE_FAILED_MSG });
    }

    res
      .status(CREATED_DOC_CODE)
      .json({ message: HOTEL_CREATE_SUCCESS_MSG, data: hotel });
  } catch (error: any) {
    console.log({ Error: error });
    throw new Error(error);
  }
};

export const getHotelDetailsByFilters = async (req: Request, res: Response) => {
  try {
    const {
      name,
      travelId,
      city,
      checkIn,
      checkOut,
      brand,
      stars,
      price,
      type,
      quest,
    } = req.body;

    // filter
    const filter = {
      ...(name && { name }),
      ...(travelId && { travelId }),
      ...(city && { city }),
      ...(checkIn && { checkIn }),
      ...(checkOut && { checkOut: new Date(checkOut) }),
      ...(brand && { brand }),
      ...(stars && { stars }),
      ...(price && { price }),
      ...(type && { type }),
      ...(quest && { quest }),
    };

    const flights = await HotelSchema.find(filter).lean();

    res.status(SUCCESS_CODE).json({
      message: HOTEL_LIST_GET_SUCCESS_MSG,
      data: flights,
    });
  } catch (error: any) {
    console.log({ Error: error });
    throw new Error(error);
  }
};

export const getHotelsName = async (req: Request, res: Response) => {
  const hotels = await HotelSchema.find({}, { name: 1 }).lean();

  res.status(SUCCESS_CODE).json({
    message: HOTEL_LIST_GET_SUCCESS_MSG,
    data: hotels,
  });
};
