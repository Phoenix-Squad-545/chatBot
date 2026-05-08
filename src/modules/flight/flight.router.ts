import express from "express";
import {
  createNewFlightCategory,
  getFlightDetailsByFilters,
} from "./flight.controller";

const router = express.Router();

router.post("/", createNewFlightCategory);

router.get("/list", getFlightDetailsByFilters);

export default router;
