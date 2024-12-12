import mongoose from "mongoose";

const stockHistorySchema = new mongoose.Schema(
  {
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Part",
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
    quantity: {
      type: Number,
      required: true,
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("StockHistory", stockHistorySchema);
