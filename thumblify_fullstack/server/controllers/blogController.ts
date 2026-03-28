import { Request, Response } from "express";
import ai from "../configs/ai.js";
import {
  GenerateContentConfig,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";

export const generateBlog = async (req: Request, res: Response) => {
  try {
    const { topic, tone = "Professional", words = 700 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    /* ================= CONFIG ================= */

    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      responseModalities: ["TEXT"],
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    };

    /* ================= PROMPT ================= */

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

    /* ================= AI CALL ================= */

    const response: any = await ai.models.generateContent({
      model: "gemini-1.5-flash", // ✅ stable
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: generationConfig,
    });

    /* ================= PARSE ================= */

    const candidate = response?.candidates?.[0];

    const blog =
      candidate?.content?.parts?.map((p: any) => p.text).join("") || "";

    if (!blog) {
      console.error("FULL RESPONSE:", JSON.stringify(response, null, 2));

      return res.status(500).json({
        success: false,
        message: "AI failed to generate blog",
      });
    }

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,
      blog,
    });

  } catch (error: any) {
    console.error("BLOG ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Blog generation failed",
    });
  }
};