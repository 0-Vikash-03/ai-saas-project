import { useState, useEffect } from "react";
import api from "../configs/api";
import { motion } from "framer-motion";

const ScriptGenerator = () => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ NEW: History state
  const [history, setHistory] = useState<any[]>([]);

  // ✅ Fetch history
  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/script/history");
      setHistory(res.data.scripts);
    } catch (error) {
      console.error("History Error:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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

      // ✅ Refresh history after new script
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-28 pb-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🚀 AI Content Script Generator
        </h2>

        {/* Topic Input */}
        <input
          type="text"
          placeholder="Enter video topic..."
          className="w-full border p-3 mb-4 rounded-lg"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Professional</option>
            <option>Motivational</option>
            <option>Funny</option>
          </select>

          <select value={length} onChange={(e) => setLength(e.target.value)}>
            <option>Short</option>
            <option>Medium</option>
            <option>Long</option>
          </select>
        </div>

        {/* Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          {loading ? "Generating..." : "Generate Script"}
        </button>

        {/* Output */}
        {script && (
          <textarea
            className="w-full mt-6 border p-4 h-80 rounded-lg"
            value={script}
            readOnly
          />
        )}

        {/* ✅ HISTORY SECTION */}
        {history.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-4">📜 Script History</h3>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setScript(item.content)}
                >
                  <p className="font-semibold">{item.topic}</p>
                  <p className="text-sm text-gray-500">
                    {item.tone} • {item.length}
                  </p>

                  <p className="text-sm mt-2 line-clamp-2">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ScriptGenerator;