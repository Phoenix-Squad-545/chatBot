import express from "express";
import {
  createNewFlightCategory,
  getFlightDetailsByFilters,
  getFlightsName,
} from "./flight.controller";

const router = express.Router();

router.post("/", createNewFlightCategory);

router.get("/flight-name", getFlightsName);

router.post("/list-by-filter", getFlightDetailsByFilters);

export default router;
