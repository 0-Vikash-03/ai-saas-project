import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";

// 🔥 Create custom type
interface AuthRequest extends Request {
  userId?: string;
}

// ✅ Get all user thumbnails
export const getUsersThumbnails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId; // ✅ from JWT

    const thumbnails = await Thumbnail.find({ userId }).sort({
      createdAt: -1,
    });

    res.json({ thumbnails });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single thumbnail
export const getThumbnailbyId = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId; // ✅ from JWT
    const { id } = req.params;

    const thumbnail = await Thumbnail.findOne({
      userId,
      _id: id,
    });

    res.json({ thumbnail });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};