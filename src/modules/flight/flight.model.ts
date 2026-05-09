import mongoose from "mongoose";
import { FLIGHT_CL } from "../../constants/schemaName";
import {
  CARD_PAYMENT,
  FAILED,
  PENDING,
  SUCCESS,
  UPI_PAYMENT,
  WALLET_PAYMENT,
} from "../../constants/appKeys";

const flightSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    travelId: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    flightClass: {
      type: String,
      required: true,
    },
    seat: {
      type: String,
      required: true,
    },
    passengers: [
      {
        name: {
          type: String,
        },
        passport: {
          type: String,
        },
        meal: {
          type: String,
        },
        status: {
          type: String,
          default: PENDING,
          enum: [PENDING, SUCCESS, FAILED],
        },
      },
    ],
    payment: {
      type: String,
      default: CARD_PAYMENT,
      enum: [CARD_PAYMENT, UPI_PAYMENT, WALLET_PAYMENT],
    },
  },
  { timestamps: true },
);

export const FlightSchema = mongoose.model(FLIGHT_CL, flightSchema);
