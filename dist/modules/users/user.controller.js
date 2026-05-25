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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("./user.model");
const statusCode_1 = require("../../constants/statusCode");
const message_1 = require("../../constants/message");
const createNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // hash password
        const hashedPassword = yield bcryptjs_1.default.hash((_a = req.body) === null || _a === void 0 ? void 0 : _a.password, 10);
        const user = yield user_model_1.UserSchema.create(Object.assign(Object.assign({}, req.body), { password: hashedPassword }));
        if (!user) {
            return res
                .status(statusCode_1.BAD_REQUEST_CODE)
                .json({ message: message_1.USER_CREATE_FAILED_MSG });
        }
        res.status(statusCode_1.CREATED_DOC_CODE).json({
            message: message_1.USER_CATEGORY_CREATE_SUCCESS_MSG,
            data: user,
        });
    }
    catch (error) {
        console.log({ Error: error });
        throw new Error(error);
    }
});
exports.createNewUser = createNewUser;
