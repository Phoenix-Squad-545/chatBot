import { Request, Response } from "express";
import { TravelSchema } from "./travel.model";
import { UserSchema } from "../users/user.model";
import {
  BAD_REQUEST_CODE,
  CREATED_DOC_CODE,
  SUCCESS_CODE,
} from "../../constants/statusCode";
import {
  TRAVEL_CATEGORY_CREATE_FAILED_MSG,
  TRAVEL_CATEGORY_CREATE_SUCCESS_MSG,
  TRAVEL_LIST_GET_SUCCESS_MSG,
  USER_NOT_FOUND_MSG,
} from "../../constants/message";

export const getTravelCategories = async (req: Request, res: Response) => {
  try {
    const user = await UserSchema.findOne(
      { email: req.body?.email },
      { _id: 1 },
    ).lean();
    if (!user) {
      return res.status(BAD_REQUEST_CODE).json({
        message: USER_NOT_FOUND_MSG,
      });
    }

    const categories = await TravelSchema.find().lean();

    res
      .status(SUCCESS_CODE)
      .json({ message: TRAVEL_LIST_GET_SUCCESS_MSG, data: categories });
  } catch (error: any) {
    console.log({ Error: error });
    throw new Error(error);
  }
};

export const createNewTravelCategory = async (req: Request, res: Response) => {
  try {
    const travelCategory = await TravelSchema.create(req.body);

    if (!travelCategory) {
      res
        .status(BAD_REQUEST_CODE)
        .json({ message: TRAVEL_CATEGORY_CREATE_FAILED_MSG });
    }

    res.status(CREATED_DOC_CODE).json({
      message: TRAVEL_CATEGORY_CREATE_SUCCESS_MSG,
      data: travelCategory,
    });
  } catch (error: any) {
    console.log({ Error: error });
    throw new Error(error);
  }
};
