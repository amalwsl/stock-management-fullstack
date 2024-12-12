import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Vehicle type is required"],
    },
    name: {
      type: String,
      required: [true, "Vehicle name is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Vehicle model is required"],
    },
    year: {
      type: Number,
      required: [true, "Manufacturing year is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
