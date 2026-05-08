import mongoose from "mongoose";
import { TRAVEL_CL } from "../../constants/schemaName";
import { CAR, FLIGHT, HOTEL, OTHERS } from "../../constants/appKeys";

const travelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: [FLIGHT, HOTEL, CAR, OTHERS],
    },
  },
  { timestamps: true },
);

export const TravelSchema = mongoose.model(TRAVEL_CL, travelSchema);
