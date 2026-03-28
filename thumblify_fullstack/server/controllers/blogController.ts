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
Write a ${words} word SEO optimized blog article.

Topic: ${topic}
Tone: ${tone}

Structure:
- Catchy SEO Title
- Introduction
- 5 detailed sections with headings
- Conclusion

Use markdown formatting.
Make it engaging and readable.
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const blog = response.text;

    if (!blog) {
      console.log("FULL RESPONSE:", response);
      return res.status(500).json({
        success: false,
        message: "AI failed to generate blog content",
      });
    }

    return res.json({
      success: true,
      blog,
    });

  } catch (error: any) {
    console.error("Blog generation error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Blog generation failed",
    });
  }
};