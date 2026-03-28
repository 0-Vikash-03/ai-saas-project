import { Request, Response } from "express";
import ai from "../configs/ai.js";
import {
  GenerateContentConfig,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";

export const generateScript = async (req: Request, res: Response) => {
  try {
    const { topic, tone = "Professional", length = "Medium" } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    /* ================= CONFIG ================= */

    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 2048,
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
You are a professional YouTube script writer.

Write a ${length} YouTube video script on: "${topic}"

Tone: ${tone}

Structure:
1. Hook
2. Problem
3. Step-by-step solution
4. Example
5. Outro with CTA

Make it engaging, clear, and beginner-friendly.
`;

    /* ================= AI CALL ================= */

    const response: any = await ai.models.generateContent({
      model: "gemini-1.5-flash", // ✅ stable model
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: generationConfig,
    });

    /* ================= PARSE RESPONSE ================= */

    const candidate = response?.candidates?.[0];

    const text =
      candidate?.content?.parts?.map((p: any) => p.text).join("") || "";

    if (!text) {
      console.error("FULL RESPONSE:", JSON.stringify(response, null, 2));

      return res.status(500).json({
        success: false,
        message: "AI failed to generate script",
      });
    }

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,
      script: text,
    });

  } catch (error: any) {
    console.error("SCRIPT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};