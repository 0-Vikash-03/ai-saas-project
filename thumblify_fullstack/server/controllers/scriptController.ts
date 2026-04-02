import { Request, Response } from "express";
import ai from "../configs/ai.js";
import Script from "../models/ScriptModel.js";

// ✅ GENERATE + SAVE SCRIPT
export const generateScript = async (req: Request, res: Response) => {
  try {
    const { topic, tone = "Professional", length = "Medium" } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const prompt = `
You are a professional YouTube script writer.

Write a ${length} YouTube video script on: "${topic}"

Tone: ${tone}

Structure:
1. Hook
2. Problem
3. Step-by-step solution
4. Example
5. Outro with CTA

Make it engaging and beginner-friendly.
`;

    const response: any = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        success: false,
        message: "AI did not return content",
      });
    }

    // ✅ SAVE TO DB
    const savedScript = await Script.create({
      topic,
      tone,
      length,
      content: text,
      userId: "demoUser",
    });

    return res.status(200).json({
      success: true,
      script: text,
      id: savedScript._id,
    });

  } catch (error: any) {
    console.error("SCRIPT ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Error generating script",
    });
  }
};

// ✅ GET HISTORY
export const getScripts = async (req: Request, res: Response) => {
  try {
    const scripts = await Script.find({ userId: "demoUser" })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      scripts,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching history",
    });
  }
};

// ✅ DELETE SCRIPT
export const deleteScript = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await Script.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

// ✅ TOGGLE FAVORITE
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const script = await Script.findById(id);

    if (!script) {
      return res.status(404).json({
        success: false,
        message: "Script not found",
      });
    }

    script.isFavorite = !script.isFavorite;
    await script.save();

    return res.json({
      success: true,
      script,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Favorite update failed",
    });
  }
};