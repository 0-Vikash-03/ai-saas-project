'use client'

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import api from "../configs/api";
import { motion } from "framer-motion";

export default function BlogGenerator() {

  // 🔥 STATES
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [words, setWords] = useState(600);
  const [blog, setBlog] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("generator");

  // ================= FETCH HISTORY =================
  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/blog/history");
      setHistory(res.data.blogs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ================= GENERATE =================
  const generateBlog = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/blog/generate", {
        topic,
        tone,
        words,
      });

      if (res.data.success) {
        setBlog(res.data.blog);
        fetchHistory();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const deleteBlog = async (id: string) => {
    await api.delete(`/api/blog/${id}`);
    fetchHistory();
  };

  // ================= FAVORITE =================
  const toggleFavorite = async (id: string) => {
    await api.patch(`/api/blog/favorite/${id}`);
    fetchHistory();
  };

  // ================= COPY =================
  const copyBlog = () => {
    navigator.clipboard.writeText(blog);
    alert("Copied!");
  };

  return (
    <div className="min-h-screen px-6">

      {/* ================= TOGGLE ================= */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2 rounded-lg ${
            activeTab === "history"
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          📜 My Blogs
        </button>

        <button
          onClick={() => setActiveTab("generator")}
          className={`px-5 py-2 rounded-lg ${
            activeTab === "generator"
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          ✍️ Generator
        </button>
      </div>

      {/* ================= GENERATOR ================= */}
      {activeTab === "generator" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto mt-10 bg-white p-6 rounded-xl shadow"
        >
          <h1 className="text-3xl font-bold mb-6">
            AI Blog Generator
          </h1>

          {/* INPUTS */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border p-3 rounded-lg"
            />

            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option>Professional</option>
              <option>Casual</option>
              <option>Marketing</option>
            </select>

            <select
              value={words}
              onChange={(e) => setWords(Number(e.target.value))}
              className="border p-3 rounded-lg"
            >
              <option value={400}>400 words</option>
              <option value={600}>600 words</option>
              <option value={800}>800 words</option>
            </select>
          </div>

          <button
            onClick={generateBlog}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}

          {/* ================= BLOG OUTPUT ================= */}
          {blog && (
            <div className="mt-10 grid lg:grid-cols-4 gap-6">

              {/* MAIN BLOG */}
              <div className="lg:col-span-3 bg-white border rounded-xl p-8 shadow-sm max-h-[75vh] overflow-y-auto scrollbar-thin">

                <div className="flex justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Generated Blog
                  </h2>

                  <button
                    onClick={copyBlog}
                    className="bg-black text-white px-4 py-1 rounded-lg"
                  >
                    Copy
                  </button>
                </div>

                <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                  <ReactMarkdown>{blog}</ReactMarkdown>
                </div>

              </div>

              {/* SIDEBAR */}
              <div className="hidden lg:block sticky top-28 h-fit">
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold mb-3">
                    📑 Sections
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600">
                    {blog
                      .split("\n")
                      .filter(line => line.startsWith("##"))
                      .map((heading, i) => (
                        <p key={i}>
                          {heading.replace("##", "")}
                        </p>
                      ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </motion.div>
      )}

      {/* ================= HISTORY ================= */}
      {activeTab === "history" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-5xl mx-auto mt-10"
        >
          <h2 className="text-2xl font-bold mb-4">
            📜 Blog History
          </h2>

          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="border p-4 rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">
                    {item.topic}
                  </h3>

                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleFavorite(item._id)}
                      className={`text-xl ${
                        item.isFavorite
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                    >
                      ⭐
                    </button>

                    <button
                      onClick={() => deleteBlog(item._id)}
                      className="text-red-500"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  {item.tone} • {item.words} words
                </p>

                <p
                  onClick={() => setBlog(item.content)}
                  className="mt-2 cursor-pointer line-clamp-2"
                >
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}