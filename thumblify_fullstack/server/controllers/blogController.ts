import { Request, Response } from "express";
import ai from "../configs/ai.js";
import Blog from "../models/BlogModel.js";

// ================= GENERATE BLOG =================
export const generateBlog = async (req: Request, res: Response) => {
  try {
    const { topic, tone = "Professional", words = 600 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    // 🔥 PROFESSIONAL PROMPT
    const prompt = `
You are a professional SEO blog writer.

Write a high-quality, ${words}-word blog post on: "${topic}"

Tone: ${tone}

Requirements:
- SEO optimized title (H1)
- Engaging introduction
- 3–5 sections with H2 headings
- Use bullet points where needed
- Include real-world examples
- Clear and professional language
- Strong conclusion
- Use Markdown formatting

Make it human-like, readable, and valuable.
`;

    const response: any = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text =
      response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        success: false,
        message: "AI did not return content",
      });
    }

    // 🔥 EXTRACT TITLE (first line)
    const title = text.split("\n")[0].replace("#", "").trim();

    // 🔥 EXTRACT EXCERPT
    const excerpt = text.split("\n").slice(1, 3).join(" ").slice(0, 150);

    // 🔥 READING TIME
    const wordCount = text.split(" ").length;
    const readingTime = Math.ceil(wordCount / 200); // 200 wpm

    // ✅ SAVE TO DB
    const saved = await Blog.create({
      title,
      topic,
      tone,
      words,
      content: text,
      excerpt,
      readingTime,
      userId: "demoUser",
    });

    return res.status(200).json({
      success: true,
      blog: text,
      meta: {
        title,
        excerpt,
        readingTime,
        wordCount,
      },
      id: saved._id,
    });

  } catch (error: any) {
    console.error("BLOG ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message || "Error generating blog",
    });
  }
};

// ================= GET HISTORY =================
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({ userId: "demoUser" })
      .sort({ createdAt: -1 })
      .select("-content"); // 🔥 faster response

    return res.status(200).json({
      success: true,
      blogs,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching blogs",
    });
  }
};

// ================= GET SINGLE BLOG =================
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.json({
      success: true,
      blog,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching blog",
    });
  }
};

// ================= DELETE =================
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Blog deleted successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

// ================= TOGGLE FAVORITE =================
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    blog.isFavorite = !blog.isFavorite;
    await blog.save();

    return res.json({
      success: true,
      isFavorite: blog.isFavorite,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Favorite update failed",
    });
  }
};