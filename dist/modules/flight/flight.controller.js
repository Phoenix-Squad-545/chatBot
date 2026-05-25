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
exports.getFlightsName = exports.getFlightDetailsByFilters = exports.createNewFlightCategory = void 0;
const statusCode_1 = require("../../constants/statusCode");
const flight_model_1 = require("./flight.model");
const message_1 = require("../../constants/message");
const createNewFlightCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const flight = yield flight_model_1.FlightSchema.create(req.body);
        if (!flight) {
            res.status(statusCode_1.BAD_REQUEST_CODE).json({ message: message_1.FLIGHT_CREATE_FAILED_MSG });
        }
        res
            .status(statusCode_1.CREATED_DOC_CODE)
            .json({ message: message_1.FLIGHT_CREATE_SUCCESS_MSG, data: flight });
    }
    catch (error) {
        console.log({ Error: error });
        throw new Error(error);
    }
});
exports.createNewFlightCategory = createNewFlightCategory;
const getFlightDetailsByFilters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, travelId, from, to, date, price, flightClass, seat, payment, } = req.body;
        // filter
        const filter = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (travelId && { travelId })), (from && { from })), (to && { to })), (date && { date: new Date(date) })), (price && { price })), (flightClass && { flightClass })), (seat && { seat })), (payment && { payment }));
        const flights = yield flight_model_1.FlightSchema.find(filter).lean();
        res.status(statusCode_1.SUCCESS_CODE).json({
            message: message_1.FLIGHT_LIST_GET_SUCCESS_MSG,
            data: flights,
        });
    }
    catch (error) {
        console.log({ Error: error });
        throw new Error(error);
    }
});
exports.getFlightDetailsByFilters = getFlightDetailsByFilters;
const getFlightsName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const flights = yield flight_model_1.FlightSchema.find({}, { name: 1 }).lean();
    res.status(statusCode_1.SUCCESS_CODE).json({
        message: message_1.FLIGHT_LIST_GET_SUCCESS_MSG,
        data: flights,
    });
});
exports.getFlightsName = getFlightsName;
