import { connect } from "mongoose";
import { DB_URL } from "../constants/envKeys";

export const mongoDBConnection = async () => {
  try {
    await connect(DB_URL);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log({ dbConnection: error });
    process.exit(1);
  }
};
