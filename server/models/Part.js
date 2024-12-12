import mongoose from "mongoose";

const partSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    referenceOrg: {
      type: String,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    turboType: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    size: String,
    image: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    state: {
      type: String,
      required: true,
      enum: ["Pièce", "Turbo terminé"], // Restrict to these two values
      default: "Pièce", // Default state
    },
  },
  { timestamps: true }
);

export default mongoose.model("Part", partSchema);
