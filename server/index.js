import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/Auth.js";
import userRoutes from "./routes/User.js";
import vehicleRoutes from "./routes/Vehicle.js";
import partRoutes from "./routes/Part.js";
import consultationRoutes from "./routes/Consultation.js";
import historyRoutes from "./routes/StockHistory.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/crm-stock")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB", err);
    process.exit(1); // Exit the app if the database connection fails
  });

// Routes
app.use("/api/auth", authRoutes);
console.log("Auth routes mounted successfully");

app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/stockHistory", historyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
