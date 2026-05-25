"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schemaName_1 = require("../../constants/schemaName");
const appKeys_1 = require("../../constants/appKeys");
const ObjectId = mongoose_1.default.Schema.Types.ObjectId;
const hotelSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    travelId: {
        type: ObjectId,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    brand: {
        type: String,
    },
    stars: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
    },
    quest: {
        type: Number,
        default: 0,
    },
    tenets: [
        {
            name: {
                type: String,
            },
            phoneNumber: {
                type: String,
            },
            count: {
                type: Number,
            },
            checkIn: {
                type: Date,
                required: true,
            },
            checkOut: {
                type: Date,
                required: true,
            },
            advance: {
                type: Number,
                default: 0,
            },
            ratings: {
                type: Number,
                max: 5,
                min: 1,
                default: 3,
            },
            payment: {
                type: String,
                default: appKeys_1.CARD_PAYMENT,
                enum: [appKeys_1.CARD_PAYMENT, appKeys_1.UPI_PAYMENT, appKeys_1.WALLET_PAYMENT],
            },
        },
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.HotelSchema = mongoose_1.default.model(schemaName_1.HOTEL_CL, hotelSchema);
