import express from "express";
import {
  createNewHotelCategory,
  getHotelDetailsByFilters,
  getHotelsName,
} from "./hotel.controller";

const router = express.Router();

router.post("/", createNewHotelCategory);

router.get("/hotel-name", getHotelsName);

router.post("/list-by-filter", getHotelDetailsByFilters);

export default router;
