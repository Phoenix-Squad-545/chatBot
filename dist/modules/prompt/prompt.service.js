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
exports.generateChatResponse = void 0;
const openAi_1 = require("../../config/openAi");
const appKeys_1 = require("../../constants/appKeys");
const message_1 = require("../../constants/message");
const generateChatResponse = (message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield openAi_1.openai.chat.completions.create({
            model: appKeys_1.GPT_TYPE,
            messages: [
                { role: appKeys_1.SYSTEM, content: "You are a helpful assistant." },
                { role: appKeys_1.USER, content: message },
            ],
        });
        return response.choices[0].message.content;
    }
    catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error(message_1.PROMPT_FAILED_MSG);
    }
});
exports.generateChatResponse = generateChatResponse;
