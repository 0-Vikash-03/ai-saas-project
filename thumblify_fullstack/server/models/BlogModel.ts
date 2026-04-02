// server/models/BlogModel.ts
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    topic:      { type: String, required: true },
    tone:       { type: String, default: "Professional" },
    words:      { type: Number, default: 600 },
    content:    { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
    userId:     { type: String, default: "demoUser" },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);