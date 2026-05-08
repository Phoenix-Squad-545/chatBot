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
    const {
      name,
      travelId,
      from,
      to,
      date,
      price,
      flightClass,
      seat,
      payment,
    } = req.body;

    // filter
    const filter = {
      ...(name && { name }),
      ...(travelId && { travelId }),
      ...(from && { from }),
      ...(to && { to }),
      ...(date && { date: new Date(date) }),
      ...(price && { price }),
      ...(flightClass && { flightClass }),
      ...(seat && { seat }),
      ...(payment && { payment }),
    };

    // project
    let projectFields = {};
    if (name) {
      projectFields = { ...projectFields, name: 1 };
    }
    if (travelId) {
      projectFields = { ...projectFields, travelId: 1 };
    }
    if (from) {
      projectFields = { ...projectFields, from: 1 };
    }
    if (to) {
      projectFields = { ...projectFields, to: 1 };
    }
    if (date) {
      projectFields = { ...projectFields, date: 1 };
    }
    if (price) {
      projectFields = { ...projectFields, price: 1 };
    }
    if (flightClass) {
      projectFields = { ...projectFields, flightClass: 1 };
    }
    if (seat) {
      projectFields = { ...projectFields, seat: 1 };
    }
    if (payment) {
      projectFields = { ...projectFields, payment: 1 };
    }

    const newCategories = await FlightSchema.findOne(filter).lean();

    res.status(SUCCESS_CODE).json({
      message: FLIGHT_LIST_GET_SUCCESS_MSG,
      data: newCategories,
    });
  } catch (error: any) {
    console.log({ Error: error });
    throw new Error(error);
  }
};

export const getFlightsName = async (req: Request, res: Response) => {
  const flights = await FlightSchema.find({}, { name: 1 }).lean();

  res.status(SUCCESS_CODE).json({
    message: FLIGHT_LIST_GET_SUCCESS_MSG,
    data: flights,
  });
};
