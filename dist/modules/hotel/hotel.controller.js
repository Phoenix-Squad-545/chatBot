"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHotelsName = exports.getHotelDetailsByFilters = exports.createNewHotelCategory = void 0;
const statusCode_1 = require("../../constants/statusCode");
const hotel_model_1 = require("./hotel.model");
const message_1 = require("../../constants/message");
const createNewHotelCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = yield hotel_model_1.HotelSchema.create(req.body);
        if (!hotel) {
            res.status(statusCode_1.BAD_REQUEST_CODE).json({ message: message_1.HOTEL_CREATE_FAILED_MSG });
        }
        res
            .status(statusCode_1.CREATED_DOC_CODE)
            .json({ message: message_1.HOTEL_CREATE_SUCCESS_MSG, data: hotel });
    }
    catch (error) {
        console.log({ Error: error });
        throw new Error(error);
    }
});
exports.createNewHotelCategory = createNewHotelCategory;
const getHotelDetailsByFilters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, travelId, city, checkIn, checkOut, brand, stars, price, type, quest, } = req.body;
        // filter
        const filter = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (travelId && { travelId })), (city && { city })), (checkIn && { checkIn })), (checkOut && { checkOut: new Date(checkOut) })), (brand && { brand })), (stars && { stars })), (price && { price })), (type && { type })), (quest && { quest }));
        const flights = yield hotel_model_1.HotelSchema.find(filter).lean();
        res.status(statusCode_1.SUCCESS_CODE).json({
            message: message_1.HOTEL_LIST_GET_SUCCESS_MSG,
            data: flights,
        });
    }
    catch (error) {
        console.log({ Error: error });
        throw new Error(error);
    }
});
exports.getHotelDetailsByFilters = getHotelDetailsByFilters;
const getHotelsName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hotels = yield hotel_model_1.HotelSchema.find({}, { name: 1 }).lean();
    res.status(statusCode_1.SUCCESS_CODE).json({
        message: message_1.HOTEL_LIST_GET_SUCCESS_MSG,
        data: hotels,
    });
});
exports.getHotelsName = getHotelsName;
