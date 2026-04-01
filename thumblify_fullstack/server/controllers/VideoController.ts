import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import Video from "../models/Video.js";

/* ================= GENERATE VIDEO ================= */

export const generateVideo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const { title, prompt: user_prompt, style } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    // ✅ Save request in DB
    const video = await Video.create({
      userId,
      title,
      user_prompt,
      style,
      isGenerating: false,
      error: "Video generation not supported yet",
    });

    return res.status(200).json({
      message: "Video feature coming soon 🚀",
      videoId: video._id,
    });

  } catch (error: any) {
    console.error("generateVideo error:", error.message);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= GET STATUS ================= */

export const getVideoStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const video = await Video.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    return res.json({
      videoId: video._id,
      isGenerating: false,
      video_url: null,
      error: video.error,
      title: video.title,
    });

  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= DELETE ================= */

export const deleteVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await Video.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    return res.json({
      message: "Video deleted successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= GET USER VIDEOS ================= */

export const getUserVideos = async (req: AuthRequest, res: Response) => {
  try {
    const videos = await Video.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.json({ videos });

  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};