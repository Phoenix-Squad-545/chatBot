import mongoose from "mongoose";
import { CAR_CL } from "../../constants/schemaName";
import {
  CARD_PAYMENT,
  FAILED,
  PENDING,
  SUCCESS,
  UPI_PAYMENT,
  WALLET_PAYMENT,
} from "../../constants/appKeys";
const ObjectId = mongoose.Schema.Types.ObjectId;

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    travelId: {
      type: ObjectId,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    nearByLocation: {
      type: String,
      required: true,
    },
    pickUpDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    passengers: [
      {
        name: {
          type: String,
        },
        phoneNumber: {
          type: String,
        },
        totalCount: {
          type: Number,
        },
        maleCount: {
          type: Number,
        },
        femaleCount: {
          type: Number,
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const CarSchema = mongoose.model(CAR_CL, carSchema);
