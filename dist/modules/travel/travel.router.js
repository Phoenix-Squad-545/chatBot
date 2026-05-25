"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const travel_controller_1 = require("./travel.controller");
const router = express_1.default.Router();
router.post("/", travel_controller_1.createNewTravelCategory);
router.post("/list", travel_controller_1.getTravelCategories);
exports.default = router;
