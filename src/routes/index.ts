import express from "express";
import chatRoutes from "../modules/prompt/prompt.router";
import travelRoutes from "../modules/travel/travel.router";
import flightRoutes from "../modules/flight/flight.router";
import { CHAT_ROUTE, FLIGHT_ROUTE, TRAVEL_ROUTE } from "../constants/routeName";

const router = express.Router();

router.use(`/${CHAT_ROUTE}`, chatRoutes);

router.use(`/${TRAVEL_ROUTE}`, travelRoutes);

router.use(`/${FLIGHT_ROUTE}`, flightRoutes);

export default router;
