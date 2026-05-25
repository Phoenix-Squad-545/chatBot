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
exports.getCarsName = exports.getCarDetailsByFilters = exports.createNewCarCategory = void 0;
const statusCode_1 = require("../../constants/statusCode");
const message_1 = require("../../constants/message");
const car_model_1 = require("./car.model");
const createNewCarCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const car = yield car_model_1.CarSchema.create(req.body);
        if (!car) {
            res.status(statusCode_1.BAD_REQUEST_CODE).json({ message: message_1.CAR_CREATE_FAILED_MSG });
        }
        res
            .status(statusCode_1.CREATED_DOC_CODE)
            .json({ message: message_1.CAR_CREATE_SUCCESS_MSG, data: car });
    }
    catch (error) {
        console.log({ Error: error });
        throw new Error(error);
    }
});
exports.createNewCarCategory = createNewCarCategory;
const getCarDetailsByFilters = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, travelId, city, nearByLocation, pickUpDate, returnDate, price, payment, } = req.body;
        // filter
        const filter = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (travelId && { travelId })), (city && { city })), (nearByLocation && { nearByLocation })), (pickUpDate && { pickUpDate: new Date(pickUpDate) })), (returnDate && { returnDate })), (price && { price })), (payment && { payment }));
        const cars = yield car_model_1.CarSchema.find(filter).lean();
        res.status(statusCode_1.SUCCESS_CODE).json({
            message: message_1.CAR_LIST_GET_SUCCESS_MSG,
            data: cars,
        });
    }
    catch (error) {
        console.log({ Error: error });
        throw new Error(error);
    }
});
exports.getCarDetailsByFilters = getCarDetailsByFilters;
const getCarsName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cars = yield car_model_1.CarSchema.find({}, { name: 1 }).lean();
    res.status(statusCode_1.SUCCESS_CODE).json({
        message: message_1.CAR_LIST_GET_SUCCESS_MSG,
        data: cars,
    });
});
exports.getCarsName = getCarsName;
