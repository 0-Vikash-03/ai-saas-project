import { Request, Response } from "express";
import ai from "../configs/ai.js";
import Blog from "../models/BlogModel.js";

// ================= GENERATE BLOG =================
export const generateBlog = async (req: Request, res: Response) => {
  try {
    const { topic, tone = "Professional", words = 600 } = req.body;

    if (!topic?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Topic is required",
      });
    }

    // 🔥 PROFESSIONAL PROMPT
    const prompt = `
You are an expert SEO blog writer.

Write a ${words}-word blog on "${topic}"

Tone: ${tone}

Rules:
- SEO optimized H1 title
- Strong introduction
- 3–5 H2 headings
- Use bullet points where useful
- Add real-world examples
- Clear, human-like writing
- Strong conclusion
- Markdown format
`;

    const response: any = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text =
      response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      return res.status(500).json({
        success: false,
        message: "AI did not return content",
      });
    }

    // ================= META EXTRACTION =================

    // ✅ TITLE
    const firstLine = text.split("\n")[0] || "Untitled Blog";
    const title = firstLine.replace(/^#+\s*/, "").trim();

    // ✅ EXCERPT
    const excerpt = text
      .split("\n")
      .slice(1, 3)
      .join(" ")
      .slice(0, 160);

    // ✅ WORD COUNT + READING TIME
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200);

    // ================= SAVE =================
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

    return res.status(201).json({
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
    console.error("BLOG ERROR:", error);

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
      .select("title topic tone words excerpt readingTime isFavorite createdAt");

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

    return res.status(200).json({
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

// ================= UPDATE BLOG =================
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content required",
      });
    }

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.json({
      success: true,
      blog: updated,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

// ================= DELETE =================
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

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