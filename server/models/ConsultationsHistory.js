import mongoose from "mongoose";

const consultationHistorySchema = new mongoose.Schema(
  {
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["input", "output", "update", "delete", "add"],
      required: true,
    },

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("ConsultationHistory", consultationHistorySchema);
