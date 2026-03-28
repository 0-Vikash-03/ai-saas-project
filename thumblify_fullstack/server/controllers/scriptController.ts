import { Request, Response } from "express";
import ai from "../configs/ai.js";

export const generateScript = async (req: Request, res: Response) => {
  try {
    const { topic, tone = "Professional", length = "Medium" } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const prompt = `
Act as a professional YouTube script writer.

Write a ${length} YouTube video script about "${topic}".

Tone: ${tone}

Structure:
1. Hook
2. Problem explanation
3. Step-by-step solution
4. Example
5. Strong outro with CTA

Make it engaging and beginner-friendly.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // you can switch to gemini-1.5-flash if needed
      contents: prompt, // ✅ correct for new SDK
    });

    // ✅ correct way to get text in NEW SDK
    const text = response.text;

    if (!text) {
      console.log("FULL RESPONSE:", response);
      return res.status(500).json({ message: "AI failed to generate content" });
    }

    return res.status(200).json({ script: text });

  } catch (error: any) {
    console.error("Script Generation Error:", error);
    return res.status(500).json({
      message: error?.message || "Internal Server Error",
    });
  }
};