import express from "express";
import { chatController } from "./prompt.controller";

const router = express.Router();

router.post("/", chatController);

export default router;
