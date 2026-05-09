import { Request, Response } from "express";
import {
  BAD_REQUEST_CODE,
  CREATED_DOC_CODE,
  SUCCESS_CODE,
} from "../../constants/statusCode";
import {
  CAR_CREATE_FAILED_MSG,
  CAR_CREATE_SUCCESS_MSG,
  CAR_LIST_GET_SUCCESS_MSG,
} from "../../constants/message";
import { CarSchema } from "./car.model";

export const createNewCarCategory = async (req: Request, res: Response) => {
  try {
    const car = await CarSchema.create(req.body);

    if (!car) {
      res.status(BAD_REQUEST_CODE).json({ message: CAR_CREATE_FAILED_MSG });
    }

    res
      .status(CREATED_DOC_CODE)
      .json({ message: CAR_CREATE_SUCCESS_MSG, data: car });
  } catch (error: any) {
    console.log({ Error: error });
    throw new Error(error);
  }
};

export const getCarDetailsByFilters = async (req: Request, res: Response) => {
  try {
    const {
      name,
      travelId,
      city,
      nearByLocation,
      pickUpDate,
      returnDate,
      price,
      payment,
    } = req.body;

    // filter
    const filter = {
      ...(name && { name }),
      ...(travelId && { travelId }),
      ...(city && { city }),
      ...(nearByLocation && { nearByLocation }),
      ...(pickUpDate && { pickUpDate: new Date(pickUpDate) }),
      ...(returnDate && { returnDate }),
      ...(price && { price }),
      ...(payment && { payment }),
    };

    const cars = await CarSchema.find(filter).lean();

    res.status(SUCCESS_CODE).json({
      message: CAR_LIST_GET_SUCCESS_MSG,
      data: cars,
    });
  } catch (error: any) {
    console.log({ Error: error });
    throw new Error(error);
  }
};

export const getCarsName = async (req: Request, res: Response) => {
  const cars = await CarSchema.find({}, { name: 1 }).lean();

  res.status(SUCCESS_CODE).json({
    message: CAR_LIST_GET_SUCCESS_MSG,
    data: cars,
  });
};
