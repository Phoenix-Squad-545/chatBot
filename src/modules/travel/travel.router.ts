import express from "express";
import {
  createNewTravelCategory,
  getTravelCategories,
} from "./travel.controller";

const router = express.Router();

router.post("/", createNewTravelCategory);

router.get("/list", getTravelCategories);

export default router;
