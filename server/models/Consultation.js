import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
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
    receptionDate: {
      type: String,
      required: true,
    },
    issueDate: {
      type: String,
      required: true,
    },
    isFixed: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Consultation", consultationSchema);
