import { useState, useEffect } from "react";
import api from "../configs/api";
import { motion } from "framer-motion";

const ScriptGenerator = () => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // ✅ FETCH HISTORY
  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/script/history");
      setHistory(res.data?.scripts || []);
    } catch (error) {
      console.error("History Error:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ✅ GENERATE SCRIPT
  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter topic");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/script/generate-script", {
        topic,
        tone,
        length,
      });

      setScript(res.data.script);
      fetchHistory();

    } catch (error: any) {
      console.error("Frontend Error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE SCRIPT
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/script/${id}`);
      fetchHistory();
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  // ✅ FAVORITE TOGGLE
  const handleFavorite = async (id: string) => {
    try {
      await api.patch(`/api/script/favorite/${id}`);
      fetchHistory();
    } catch (error) {
      console.error("Favorite Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-28 px-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8"
      >

        {/* ================= LEFT: HISTORY ================= */}
        <div className="bg-white rounded-2xl shadow p-6 h-[80vh] overflow-y-auto">

          <h2 className="text-2xl font-bold mb-4">📜 My Scripts</h2>

          {history.length === 0 && (
            <p className="text-gray-500">No scripts found</p>
          )}

          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item._id}
                className="border p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >

                {/* CLICK TO LOAD */}
                <div
                  onClick={() => setScript(item.content)}
                  className="cursor-pointer"
                >
                  <p className="font-semibold">{item.topic}</p>
                  <p className="text-sm text-gray-500">
                    {item.tone} • {item.length}
                  </p>

                  <p className="text-sm mt-2 line-clamp-2">
                    {item.content}
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-between items-center mt-3">

                  {/* ⭐ FAVORITE */}
                  <button
                    onClick={() => handleFavorite(item._id)}
                    className="text-yellow-500 text-lg"
                  >
                    {item.isFavorite ? "⭐" : "☆"}
                  </button>

                  {/* 🗑 DELETE */}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT: GENERATOR ================= */}
        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-2xl font-bold mb-6 text-center">
            🚀 Script Generator
          </h2>

          {/* INPUT */}
          <input
            type="text"
            placeholder="Enter video topic..."
            className="w-full border p-3 mb-4 rounded-lg"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          {/* OPTIONS */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="border p-2 rounded"
            >
              <option>Professional</option>
              <option>Motivational</option>
              <option>Funny</option>
            </select>

            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="border p-2 rounded"
            >
              <option>Short</option>
              <option>Medium</option>
              <option>Long</option>
            </select>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Generating..." : "Generate Script"}
          </button>

          {/* OUTPUT */}
          {script && (
            <textarea
              className="w-full mt-6 border p-4 h-64 rounded-lg"
              value={script}
              readOnly
            />
          )}

        </div>

      </motion.div>
    </div>
  );
};

export default ScriptGenerator;