'use client'

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import api from "../configs/api";
import { motion } from "framer-motion";

export default function BlogGenerator() {

  // ================= STATES =================
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [words, setWords] = useState(600);
  const [blog, setBlog] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"generator" | "history">("generator");

  // ================= FETCH HISTORY =================
  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/blog/history");
      setHistory(res.data.blogs || []);
    } catch (err) {
      console.error("History Error:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ================= GENERATE =================
  const generateBlog = async () => {
    if (!topic.trim()) {
      alert("Enter topic");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/blog/generate", {
        topic,
        tone,
        words,
      });

      if (res.data.success) {
        setBlog(res.data.blog);
        setActiveTab("generator");
        fetchHistory();
      }

    } catch (err: any) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const deleteBlog = async (id: string, e: any) => {
    e.stopPropagation();
    await api.delete(`/api/blog/${id}`);
    fetchHistory();
  };

  // ================= FAVORITE =================
  const toggleFavorite = async (id: string, e: any) => {
    e.stopPropagation();
    await api.patch(`/api/blog/favorite/${id}`);
    fetchHistory();
  };

  // ================= COPY =================
  const copyBlog = () => {
    navigator.clipboard.writeText(blog);
    alert("Copied!");
  };

  // ================= CLICK BLOG =================
  const openBlog = (content: string) => {
    setBlog(content);
    setActiveTab("generator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">

      {/* ================= TAB SWITCH ================= */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-2 rounded-lg transition ${
            activeTab === "history"
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          📜 My Blogs
        </button>

        <button
          onClick={() => setActiveTab("generator")}
          className={`px-6 py-2 rounded-lg transition ${
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
          className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow"
        >

          <h1 className="text-3xl font-bold mb-6">
            AI Blog Generator
          </h1>

          {/* INPUTS */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic..."
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
            {loading ? "Generating..." : "Generate Blog"}
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}

          {/* BLOG OUTPUT */}
          {blog && (
            <div className="mt-10 grid lg:grid-cols-4 gap-6">

              {/* MAIN CONTENT */}
              <div className="lg:col-span-3 border rounded-xl p-6 max-h-[75vh] overflow-y-auto">

                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-bold">Generated Blog</h2>
                  <button
                    onClick={copyBlog}
                    className="bg-black text-white px-4 py-1 rounded"
                  >
                    Copy
                  </button>
                </div>

                <div className="prose max-w-none">
                  <ReactMarkdown>{blog}</ReactMarkdown>
                </div>

              </div>

              {/* SIDEBAR */}
              <div className="hidden lg:block sticky top-24">
                <div className="border p-4 rounded-xl">
                  <h3 className="font-semibold mb-3">📑 Sections</h3>

                  {blog
                    .split("\n")
                    .filter(line => line.startsWith("##"))
                    .map((h, i) => (
                      <p key={i} className="text-sm text-gray-600">
                        {h.replace("##", "")}
                      </p>
                    ))}
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
          className="max-w-5xl mx-auto"
        >

          <h2 className="text-2xl font-bold mb-4">
            📜 Blog History
          </h2>

          <div className="space-y-4">

            {history.map((item) => (
              <div
                key={item._id}
                onClick={() => openBlog(item.content)}
                className="border p-4 rounded-lg bg-white hover:bg-gray-100 cursor-pointer transition"
              >

                <div className="flex justify-between">

                  <div>
                    <h3 className="font-semibold">{item.topic}</h3>
                    <p className="text-sm text-gray-500">
                      {item.tone} • {item.words} words
                    </p>
                  </div>

                  <div className="flex gap-3">

                    <button
                      onClick={(e) => toggleFavorite(item._id, e)}
                      className={item.isFavorite ? "text-yellow-500" : "text-gray-400"}
                    >
                      ⭐
                    </button>

                    <button
                      onClick={(e) => deleteBlog(item._id, e)}
                      className="text-red-500"
                    >
                      🗑
                    </button>

                  </div>
                </div>

                <p className="text-sm mt-2 line-clamp-2">
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