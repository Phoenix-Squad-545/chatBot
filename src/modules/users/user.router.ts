import express from "express";

import { createNewUser } from "./user.controller";

const route = express.Router();

route.post("/", createNewUser);

export default route;
