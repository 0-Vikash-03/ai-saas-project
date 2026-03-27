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

        const response: any = await ai.models.generateContent({
            model: "gemini-2.5-flash",   // ✅ CORRECT & LATEST
            contents: [prompt],
            config: {
                temperature: 0.8,
                maxOutputTokens: 4096,
            },
        });
        const text =
            response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Failed to generate script");
        }

        res.json({ script: text });

    } catch (error: any) {
        console.log("Script Generation Error:", error);
        res.status(500).json({ message: error.message });
    }
};