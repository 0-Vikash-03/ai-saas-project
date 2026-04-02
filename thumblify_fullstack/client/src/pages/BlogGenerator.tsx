'use client'

import { useState, useEffect } from "react";
import api from "../configs/api";

export default function BlogGenerator() {

  // ================= STATES =================
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [words, setWords] = useState(600);
  const [blog, setBlog] = useState("");

  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"history" | "generator">("history");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const [loading, setLoading] = useState(false);

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
    if (!topic.trim()) return alert("Enter topic");

    try {
      setLoading(true);

      const res = await api.post("/api/blog/generate", {
        topic,
        tone,
        words,
      });

      if (res.data.success) {
        setBlog(res.data.blog);
        fetchHistory();
      }

    } catch {
      alert("❌ Error generating blog");
    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN =================
  const handleOpen = (item: any) => {
    setExpandedId(item._id);
    setEditContent(item.content);
  };

  // ================= UPDATE =================
  const updateBlog = async (id: string) => {
    try {
      await api.put(`/api/blog/${id}`, {
        content: editContent,
      });

      alert("✅ Updated");
      setExpandedId(null);
      fetchHistory();

    } catch {
      alert("❌ Update failed");
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

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">

      {/* ================= TABS ================= */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-2 rounded-lg font-medium ${
            activeTab === "history"
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          📜 My Blogs
        </button>

        <button
          onClick={() => setActiveTab("generator")}
          className={`px-6 py-2 rounded-lg font-medium ${
            activeTab === "generator"
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          ✍️ Generator
        </button>
      </div>

      {/* ================= HISTORY ================= */}
      {activeTab === "history" && (
        <div className="max-w-5xl mx-auto">

          <h2 className="text-3xl font-bold mb-6">
            📜 Blog History
          </h2>

          {history.length === 0 && (
            <p className="text-gray-500 text-center">
              No blogs yet. Generate one 🚀
            </p>
          )}

          <div className="space-y-4">

            {history.map((item) => (
              <div
                key={item._id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
              >

                {/* HEADER */}
                <div
                  onClick={() => handleOpen(item)}
                  className="flex justify-between cursor-pointer"
                >
                  <div>
                    <h3 className="font-semibold text-lg">
                      {item.title || item.topic}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.tone} • {item.words} words
                    </p>
                  </div>

                  <div className="flex gap-3 items-center">

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

                {/* ================= EDITOR ================= */}
                {expandedId === item._id && (
                  <div className="mt-5">

                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-64 border p-4 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />

                    <div className="flex gap-3 mt-3">

                      <button
                        onClick={() => updateBlog(item._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                      >
                        💾 Save
                      </button>

                      <button
                        onClick={() => setExpandedId(null)}
                        className="bg-gray-400 text-white px-4 py-2 rounded"
                      >
                        ❌ Close
                      </button>

                    </div>

                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= GENERATOR ================= */}
      {activeTab === "generator" && (
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow">

          <h1 className="text-3xl font-bold mb-6">
            AI Blog Generator
          </h1>

          <div className="grid md:grid-cols-3 gap-4 mb-6">

            <input
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
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            {loading ? "Generating..." : "Generate Blog"}
          </button>

          {blog && (
            <textarea
              value={blog}
              readOnly
              className="w-full mt-6 h-64 border p-4 rounded-lg"
            />
          )}

        </div>
      )}
    </div>
  );
}