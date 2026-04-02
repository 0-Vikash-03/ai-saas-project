import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title:      { type: String }, // ✅ NEW
    topic:      { type: String, required: true },
    tone:       { type: String, default: "Professional" },
    words:      { type: Number, default: 600 },
    content:    { type: String, required: true },

    excerpt:    { type: String }, // ✅ NEW
    readingTime:{ type: Number }, // ✅ NEW

    isFavorite: { type: Boolean, default: false },
    userId:     { type: String, default: "demoUser" },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);