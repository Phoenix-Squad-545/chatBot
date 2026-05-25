import express from "express";
import {
  createNewCarCategory,
  getCarDetailsByFilters,
  getCarsName,
} from "./car.controller";

const router = express.Router();

router.post("/", createNewCarCategory);

router.get("/car-name", getCarsName);

router.post("/list-by-filter", getCarDetailsByFilters);

export default router;
