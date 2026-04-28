import { Request, Response } from "express";
import { generateChatResponse } from "./prompt.service";
import {
  PROMPT_MESSAGE_PAYLOAD_MSG,
  SOMETHING_WENT_WRONG_MSG,
} from "../../constants/message";
import {
  BAD_REQUEST_CODE,
  INTERNAL_SERVER_ERROR_CODE,
} from "../../constants/statusCode";

export const chatController = async (req: Request, res: Response) => {
  try {
    const message = req.body?.message;

    if (!message) {
      return res
        .status(BAD_REQUEST_CODE)
        .json({ error: PROMPT_MESSAGE_PAYLOAD_MSG });
    }

    const reply = await generateChatResponse(message);
    console.log({ reply });

    res.json({
      success: true,
      data: reply,
    });
  } catch (error) {
    console.log({ error });

    res.status(INTERNAL_SERVER_ERROR_CODE).json({
      success: false,
      message: SOMETHING_WENT_WRONG_MSG,
    });
  }
};
