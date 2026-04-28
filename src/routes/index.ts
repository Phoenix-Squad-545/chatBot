import express from "express";
import chatRoutes from "../modules/prompt/prompt.router";
import { CHAT_ROUTE } from "../constants/routeName";

const router = express.Router();

router.use(`/${CHAT_ROUTE}`, chatRoutes);

export default router;
