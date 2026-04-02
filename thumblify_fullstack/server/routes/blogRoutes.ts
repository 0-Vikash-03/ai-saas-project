import express from "express";
import {
  generateBlog,
  getBlogs,
  deleteBlog,
  toggleFavorite,
  getBlogById
} from "../controllers/blogController.js";

const router = express.Router();

// ✅ CREATE + SAVE
router.post("/generate", generateBlog);

// ✅ GET ALL BLOGS (HISTORY)
router.get("/history", getBlogs);

// ✅ GET SINGLE BLOG
router.get("/:id", getBlogById);

// ✅ DELETE BLOG
router.delete("/:id", deleteBlog);

// ✅ FAVORITE TOGGLE
router.patch("/favorite/:id", toggleFavorite);

export default router;