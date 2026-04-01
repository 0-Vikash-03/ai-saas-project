import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import Thumbnail from "../models/Thumbnail.js";
import ai from "../configs/ai.js";

/* ================= SANITIZE ================= */
function sanitizeInput(text: string) {
  if (!text) return "";

  return text
    .replace(/(blood|kill|murder|violence|nude|sex|terror|attack)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ================= GENERATE ================= */

export const generateThumbnail = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { title, prompt: user_prompt, style, color_scheme } = req.body;

    const safePrompt = sanitizeInput(user_prompt || "");

    /* ================= SAVE INIT ================= */

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: safePrompt,
      user_prompt: safePrompt,
      style,
      color_scheme,
      isGenerating: true,
    });

    /* ================= AI PROMPT ================= */

    const prompt = `
Create a YouTube thumbnail concept for:

Title: "${title}"

Style: ${style || "modern"}
Color theme: ${color_scheme || "vibrant"}

Extra details: ${safePrompt}

Describe:
- layout
- colors
- text placement
- visuals

Make it eye-catching and clickable.
`;

    /* ================= AI CALL (FIXED) ================= */

    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const idea = response.text();

    if (!idea) {
      throw new Error("AI failed to generate thumbnail idea");
    }

    /* ================= SAVE RESULT ================= */

    thumbnail.image_url =
      "https://via.placeholder.com/1280x720.png?text=Thumbnail+Preview"; // placeholder
    thumbnail.description = idea;
    thumbnail.isGenerating = false;

    await thumbnail.save();

    return res.json({
      success: true,
      message: "Thumbnail idea generated",
      thumbnail,
    });

  } catch (error: any) {
    console.error("Thumbnail error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/* ================= DELETE ================= */

export const deleteThumbnail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await Thumbnail.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    return res.json({
      success: true,
      message: "Thumbnail deleted",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};