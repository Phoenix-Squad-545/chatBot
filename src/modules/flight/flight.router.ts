import express from "express";
import {
  createNewFlightCategory,
  getFlightDetailsByFilters,
} from "./flight.controller";

const router = express.Router();

router.post("/", createNewFlightCategory);

router.post("/list-by-filter", getFlightDetailsByFilters);

export default router;
