import { Request, Response } from "express";
import ai from "../configs/ai.js";

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

    // ✅ New SDK method
    const response: any = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        success: false,
        message: "AI did not return content",
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