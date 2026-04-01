import { Request, Response } from "express";
import ai from "../configs/ai.js";

export const generateBlog = async (req: Request, res: Response) => {
  try {
    const { topic, tone = "Professional", words = 700 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    const prompt = `
You are an expert SEO blog writer.

Write a ${words}-word blog post.

Topic: "${topic}"
Tone: ${tone}

Structure:
- SEO optimized catchy title
- Introduction
- 5 detailed sections with headings
- Conclusion

Use markdown formatting.
Make it engaging, informative, and easy to read.
`;

    // ✅ New SDK method
    const response: any = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // ✅ Updated model name",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const blog = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "AI failed to generate blog",
      });
    }

    return res.status(200).json({
      success: true,
      blog,
    });

  } catch (error: any) {
    console.error("BLOG ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Blog generation failed",
    });
  }
};