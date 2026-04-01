import { useState } from "react";
import { motion } from "framer-motion";
import api from "../configs/api"; // ✅ import your axios instance

const ContentGenerator = () => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic) return alert("Please enter topic");

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/script/generate-script", { topic, tone, length }); // ✅ uses Render URL

      setScript(res.data.script);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error generating script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col px-6 md:px-16 py-10">

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-6"
      >
        AI Content Script Generator
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 bg-white rounded-xl shadow-md p-6 overflow-y-auto border"
        style={{ minHeight: "400px", maxHeight: "60vh" }}
      >
        {script ? (
          <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {script}
          </pre>
        ) : (
          <p className="text-gray-400">Your generated script will appear here...</p>
        )}
      </motion.div>

      {error && (
        <p className="mt-4 text-red-500 text-sm">{error}</p>
      )}

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-6 bg-white p-6 rounded-xl shadow-md border"
      >
        <input
          type="text"
          placeholder="Enter video topic..."
          className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div className="flex gap-4 mb-4">
          <select
            className="border rounded-lg p-2 flex-1"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option>Professional</option>
            <option>Motivational</option>
            <option>Funny</option>
          </select>

          <select
            className="border rounded-lg p-2 flex-1"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          >
            <option>Short</option>
            <option>Medium</option>
            <option>Long</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !topic}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-semibold disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Script"}
        </button>
      </motion.div>
    </div>
  );
};

export default ContentGenerator;