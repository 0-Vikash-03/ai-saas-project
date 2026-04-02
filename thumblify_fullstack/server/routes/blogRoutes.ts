import express from "express";
import {
  generateBlog,
  getBlogs,
  getBlogById,
  deleteBlog,
  toggleFavorite,
  updateBlog
} from "../controllers/blogController.js";

const router = express.Router();

router.post("/generate", generateBlog);
router.get("/history", getBlogs);
router.get("/:id", getBlogById);
router.delete("/:id", deleteBlog);
router.patch("/favorite/:id", toggleFavorite);
router.put("/:id", updateBlog);

export default router;