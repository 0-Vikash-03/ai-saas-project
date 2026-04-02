import mongoose from "mongoose";

const scriptSchema = new mongoose.Schema(
  {
    topic: String,
    tone: String,
    length: String,
    content: String,
    userId: String,
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Script", scriptSchema);