// server/controllers/blogController.ts
import { Request, Response } from "express";
import ai from "../configs/ai.js";
import Blog from "../models/BlogModel.js";

// ✅ GENERATE + SAVE
export const generateBlog = async (req: Request, res: Response) => {
  try {
    const { topic, tone = "Professional", words = 600 } = req.body;
    if (!topic) return res.status(400).json({ success: false, message: "Topic required" });

    const prompt = `
Write a ${words}-word blog post on: "${topic}"
Tone: ${tone}
Structure: Title, Introduction, 3-4 sections with headings, Conclusion.
Make it engaging, SEO-friendly, and well-structured in Markdown.
`;

    const response: any = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(500).json({ success: false, message: "AI returned no content" });

    const saved = await Blog.create({ topic, tone, words, content: text, userId: "demoUser" });

    return res.status(200).json({ success: true, blog: text, id: saved._id });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET HISTORY
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({ userId: "demoUser" }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, blogs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Error fetching blogs" });
  }
};

// ✅ DELETE
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// ✅ TOGGLE FAVORITE
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Not found" });
    blog.isFavorite = !blog.isFavorite;
    await blog.save();
    return res.json({ success: true, blog });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Favorite update failed" });
  }
};