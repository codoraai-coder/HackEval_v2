import mongoose from "mongoose";
import { DB_NAME } from "../constants/constants.js";

const connectDB = async () => {
  try {
    // Build connection URI, handling query params properly
    let uri = process.env.MONGODB_URI;

    // If URI has query params, insert DB name before them
    if (uri.includes('?')) {
      uri = uri.replace('?', `/${DB_NAME}?`);
    } else {
      uri = `${uri}/${DB_NAME}`;
    }

    const connectionInstance = await mongoose.connect(uri);
    console.log(
      `\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MONGODB connection error: " + error);
    process.exit(1);
  }
};

export default connectDB;
