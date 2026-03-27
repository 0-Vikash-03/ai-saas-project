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

    const response: any = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
    });

    const blog = response.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      blog,
    });

  } catch (error) {

    console.error("Blog generation error:", error);

    res.status(500).json({
      success: false,
      message: "Blog generation failed",
    });

  }
};