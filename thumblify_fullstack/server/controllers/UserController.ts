import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import Thumbnail from "../models/Thumbnail.js";

// ✅ Get all user thumbnails
export const getUsersThumbnails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

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
    const userId = req.userId;
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