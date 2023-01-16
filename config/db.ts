import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_URI!);
  } catch (error: any) {
    console.log("Connection to database failed", error.message);
  }

  const connection = mongoose.connection;
  if (connection.readyState >= 1) {
    console.log("Connected to database");
    return;
  }
  connection.on("error", () => console.log("Connection failed"));
};

export default connectDB;
