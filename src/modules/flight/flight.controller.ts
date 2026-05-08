import { Request, Response } from "express";
import {
  BAD_REQUEST_CODE,
  CREATED_DOC_CODE,
  SUCCESS_CODE,
} from "../../constants/statusCode";
import { FlightSchema } from "./flight.model";
import {
  FLIGHT_CREATE_FAILED_MSG,
  FLIGHT_CREATE_SUCCESS_MSG,
  FLIGHT_LIST_GET_SUCCESS_MSG,
} from "../../constants/message";

export const createNewFlightCategory = async (req: Request, res: Response) => {
  try {
    const flight = await FlightSchema.create(req.body);

    if (!flight) {
      res.status(BAD_REQUEST_CODE).json({ message: FLIGHT_CREATE_FAILED_MSG });
    }

    res
      .status(CREATED_DOC_CODE)
      .json({ message: FLIGHT_CREATE_SUCCESS_MSG, data: flight });
  } catch (error: any) {
    console.log({ Error: error });
    throw new Error(error);
  }
};

export const getFlightDetailsByFilters = async (
  req: Request,
  res: Response,
) => {
  try {
    const travelId = req.query?.travelId;
    const filter = travelId ? { travelId } : {};
    const newCategories = await FlightSchema.find(filter).lean();

    res.status(SUCCESS_CODE).json({
      message: FLIGHT_LIST_GET_SUCCESS_MSG,
      data: newCategories,
    });
  } catch (error: any) {
    console.log({ Error: error });
    throw new Error(error);
  }
};
