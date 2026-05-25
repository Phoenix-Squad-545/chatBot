"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const flight_controller_1 = require("./flight.controller");
const router = express_1.default.Router();
router.post("/", flight_controller_1.createNewFlightCategory);
router.get("/flight-name", flight_controller_1.getFlightsName);
router.post("/list-by-filter", flight_controller_1.getFlightDetailsByFilters);
exports.default = router;
