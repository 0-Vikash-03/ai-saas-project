import { Request, Response } from "express";
import genAI from "../configs/ai.js";

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

    // ✅ Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text();

    if (!text) {
      return res.status(500).json({
        success: false,
        message: "AI failed to generate script",
      });
    }

    return res.status(200).json({
      success: true,
      script: text,
    });

  } catch (error: any) {
    console.error("SCRIPT ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Error generating script",
    });
  }
};