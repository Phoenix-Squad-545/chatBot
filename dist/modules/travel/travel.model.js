"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schemaName_1 = require("../../constants/schemaName");
const appKeys_1 = require("../../constants/appKeys");
const travelSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        enum: [appKeys_1.FLIGHT, appKeys_1.HOTEL, appKeys_1.CAR, appKeys_1.OTHERS],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.TravelSchema = mongoose_1.default.model(schemaName_1.TRAVEL_CL, travelSchema);
