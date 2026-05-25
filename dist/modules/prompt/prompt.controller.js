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
exports.chatController = void 0;
const prompt_service_1 = require("./prompt.service");
const message_1 = require("../../constants/message");
const statusCode_1 = require("../../constants/statusCode");
const chatController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const message = (_a = req.body) === null || _a === void 0 ? void 0 : _a.message;
        if (!message) {
            return res
                .status(statusCode_1.BAD_REQUEST_CODE)
                .json({ error: message_1.PROMPT_MESSAGE_PAYLOAD_MSG });
        }
        const reply = yield (0, prompt_service_1.generateChatResponse)(message);
        console.log({ reply });
        res.json({
            success: true,
            data: reply,
        });
    }
    catch (error) {
        console.log({ error });
        res.status(statusCode_1.INTERNAL_SERVER_ERROR_CODE).json({
            success: false,
            message: message_1.SOMETHING_WENT_WRONG_MSG,
        });
    }
});
exports.chatController = chatController;
