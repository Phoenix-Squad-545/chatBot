"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hotel_controller_1 = require("./hotel.controller");
const router = express_1.default.Router();
router.post("/", hotel_controller_1.createNewHotelCategory);
router.get("/hotel-name", hotel_controller_1.getHotelsName);
router.post("/list-by-filter", hotel_controller_1.getHotelDetailsByFilters);
exports.default = router;
