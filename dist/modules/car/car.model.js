"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schemaName_1 = require("../../constants/schemaName");
const appKeys_1 = require("../../constants/appKeys");
const ObjectId = mongoose_1.default.Schema.Types.ObjectId;
const carSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    travelId: {
        type: ObjectId,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    nearByLocation: {
        type: String,
        required: true,
    },
    pickUpDate: {
        type: Date,
        required: true,
    },
    returnDate: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    passengers: [
        {
            name: {
                type: String,
            },
            phoneNumber: {
                type: String,
            },
            totalCount: {
                type: Number,
            },
            maleCount: {
                type: Number,
            },
            femaleCount: {
                type: Number,
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
exports.CarSchema = mongoose_1.default.model(schemaName_1.CAR_CL, carSchema);
