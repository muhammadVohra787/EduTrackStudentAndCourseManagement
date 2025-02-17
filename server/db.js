import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
console.log(`Running in ${process.env.STAGE} mode`);

const mongoURI =
  process.env.STAGE === "PRODUCTION"
    ? process.env.MONGO_PROD_URI
    : process.env.MONGO_DEV_URI;
 
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB database")
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

export { mongoose };
 