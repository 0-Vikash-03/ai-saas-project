import mongoose from "mongoose";

const scriptSchema = new mongoose.Schema(
  {
    topic: String,
    tone: String,
    length: String,
    content: String,
    userId: String,
  },
  { timestamps: true }
);

export default mongoose.model("Script", scriptSchema);