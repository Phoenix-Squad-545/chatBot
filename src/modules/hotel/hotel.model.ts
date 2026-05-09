import mongoose from "mongoose";
import { HOTEL_CL } from "../../constants/schemaName";
import {
  CARD_PAYMENT,
  UPI_PAYMENT,
  WALLET_PAYMENT,
} from "../../constants/appKeys";
const ObjectId = mongoose.Schema.Types.ObjectId;

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    travelId: {
      type: ObjectId,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    brand: {
      type: String,
    },
    stars: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
    },
    quest: {
      type: Number,
      default: 0,
    },
    tenets: [
      {
        name: {
          type: String,
        },
        phoneNumber: {
          type: String,
        },
        count: {
          type: Number,
        },
        checkIn: {
          type: Date,
          required: true,
        },
        checkOut: {
          type: Date,
          required: true,
        },
        advance: {
          type: Number,
          default: 0,
        },
        ratings: {
          type: Number,
          max: 5,
          min: 1,
          default: 3,
        },
        payment: {
          type: String,
          default: CARD_PAYMENT,
          enum: [CARD_PAYMENT, UPI_PAYMENT, WALLET_PAYMENT],
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const HotelSchema = mongoose.model(HOTEL_CL, hotelSchema);
