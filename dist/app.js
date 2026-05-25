"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const message_1 = require("./constants/message");
const envKeys_1 = require("./constants/envKeys");
const routeName_1 = require("./constants/routeName");
const routes_1 = __importDefault(require("./routes"));
const db_1 = require("./config/db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(`/${routeName_1.API_ROUTE}`, routes_1.default);
// db connect
(0, db_1.mongoDBConnection)();
app.get("/", (req, res) => {
    res.send(message_1.APP_BASE_RUN_MSG);
});
app.listen(envKeys_1.APP_PORT, () => console.log(message_1.APP_BASE_RUN_MSG));
