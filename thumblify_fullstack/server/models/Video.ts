import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        title: { type: String, required: true },
        user_prompt: { type: String },
        style: { type: String },
        aspect_ratio: { type: String, default: '16:9' },
        duration: { type: Number, default: 8 },
        video_url: { type: String },
        isGenerating: { type: Boolean, default: false },
        error: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model('Video', videoSchema);