"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schemaName_1 = require("../../constants/schemaName");
const appKeys_1 = require("../../constants/appKeys");
const ObjectId = mongoose_1.default.Schema.Types.ObjectId;
const flightSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    travelId: {
        type: ObjectId,
        required: true,
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    flightClass: {
        type: String,
        required: true,
    },
    seat: {
        type: String,
        required: true,
    },
    passengers: [
        {
            name: {
                type: String,
            },
            passport: {
                type: String,
            },
            meal: {
                type: String,
            },
            status: {
                type: String,
                default: appKeys_1.PENDING,
                enum: [appKeys_1.PENDING, appKeys_1.SUCCESS, appKeys_1.FAILED],
            },
        },
    ],
    payment: {
        type: String,
        default: appKeys_1.CARD_PAYMENT,
        enum: [appKeys_1.CARD_PAYMENT, appKeys_1.UPI_PAYMENT, appKeys_1.WALLET_PAYMENT],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.FlightSchema = mongoose_1.default.model(schemaName_1.FLIGHT_CL, flightSchema);
