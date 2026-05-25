import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserSchema } from "./user.model";
import { BAD_REQUEST_CODE, CREATED_DOC_CODE } from "../../constants/statusCode";
import {
  USER_CREATE_FAILED_MSG,
  USER_CATEGORY_CREATE_SUCCESS_MSG,
} from "../../constants/message";

export const createNewUser = async (req: Request, res: Response) => {
  try {
    // hash password
    const hashedPassword = await bcrypt.hash(req.body?.password, 10);

    const user = await UserSchema.create({
      ...req.body,
      password: hashedPassword,
    });
    if (!user) {
      return res
        .status(BAD_REQUEST_CODE)
        .json({ message: USER_CREATE_FAILED_MSG });
    }

    res.status(CREATED_DOC_CODE).json({
      message: USER_CATEGORY_CREATE_SUCCESS_MSG,
      data: user,
    });
  } catch (error: any) {
    console.log({ Error: error });
    throw new Error(error);
  }
};
