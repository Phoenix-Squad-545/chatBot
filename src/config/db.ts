import { connect } from "mongoose";
import { DB_URL } from "../constants/envKeys";
import { FlightSchema } from "../modules/flight/flight.model";

export const mongoDBConnection = async () => {
  try {
    await connect(DB_URL);
    console.log("MongoDB Connected");

    await FlightSchema.syncIndexes();

    console.log("Indexes Synced");
  } catch (error) {
    console.log({ dbConnection: error });
    process.exit(1);
  }
};
