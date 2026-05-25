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
exports.createNewTravelCategory = exports.getTravelCategories = void 0;
const travel_model_1 = require("./travel.model");
const user_model_1 = require("../users/user.model");
const statusCode_1 = require("../../constants/statusCode");
const message_1 = require("../../constants/message");
const getTravelCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield user_model_1.UserSchema.findOne({ email: (_a = req.body) === null || _a === void 0 ? void 0 : _a.email }, { _id: 1 }).lean();
        if (!user) {
            return res.status(statusCode_1.BAD_REQUEST_CODE).json({
                message: message_1.USER_NOT_FOUND_MSG,
            });
        }
        const categories = yield travel_model_1.TravelSchema.find().lean();
        res
            .status(statusCode_1.SUCCESS_CODE)
            .json({ message: message_1.TRAVEL_LIST_GET_SUCCESS_MSG, data: categories });
    }
    catch (error) {
        console.log({ Error: error });
        throw new Error(error);
    }
});
exports.getTravelCategories = getTravelCategories;
const createNewTravelCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const travelCategory = yield travel_model_1.TravelSchema.create(req.body);
        if (!travelCategory) {
            res
                .status(statusCode_1.BAD_REQUEST_CODE)
                .json({ message: message_1.TRAVEL_CATEGORY_CREATE_FAILED_MSG });
        }
        res.status(statusCode_1.CREATED_DOC_CODE).json({
            message: message_1.TRAVEL_CATEGORY_CREATE_SUCCESS_MSG,
            data: travelCategory,
        });
    }
    catch (error) {
        console.log({ Error: error });
        throw new Error(error);
    }
});
exports.createNewTravelCategory = createNewTravelCategory;
