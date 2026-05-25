"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const car_controller_1 = require("./car.controller");
const router = express_1.default.Router();
router.post("/", car_controller_1.createNewCarCategory);
router.get("/car-name", car_controller_1.getCarsName);
router.post("/list-by-filter", car_controller_1.getCarDetailsByFilters);
exports.default = router;
