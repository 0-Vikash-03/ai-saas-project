import { useState, useEffect } from "react";
import api from "../configs/api";
import { motion, AnimatePresence } from "framer-motion";

const TONE_STYLES: Record<string, string> = {
  Professional: "bg-blue-100 text-blue-700",
  Motivational: "bg-green-100 text-green-700",
  Funny:        "bg-yellow-100 text-yellow-700",
};

const ScriptGenerator = () => {
  const [topic, setTopic]   = useState("");
  const [tone, setTone]     = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  const [history, setHistory]             = useState<any[]>([]);
  const [filtered, setFiltered]           = useState<any[]>([]);
  const [toneFilter, setToneFilter]       = useState("All");
  const [lengthFilter, setLengthFilter]   = useState("All");
  const [showFavorites, setShowFavorites] = useState(false);
  const [selected, setSelected]           = useState<any | null>(null);

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

  // ✅ FILTER LOGIC
  useEffect(() => {
    let data = [...history];
    if (toneFilter !== "All")   data = data.filter((s) => s.tone   === toneFilter);
    if (lengthFilter !== "All") data = data.filter((s) => s.length === lengthFilter);
    if (showFavorites)          data = data.filter((s) => s.isFavorite);
    setFiltered(data);
  }, [history, toneFilter, lengthFilter, showFavorites]);

  // ✅ GENERATE SCRIPT
  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter topic");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/api/script/generate-script", { topic, tone, length });
      setScript(res.data.script);
      fetchHistory();
    } catch (error: any) {
      console.error("Frontend Error:", error);
      const message =
        error?.response?.data?.message || error?.message || "Something went wrong";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE SCRIPT
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/script/${id}`);
      setSelected(null);
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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day:   "numeric",
      year:  "numeric",
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-28 px-6 pb-12">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8"
      >

        {/* ================= LEFT: HISTORY ================= */}
        <div className="bg-white rounded-2xl shadow p-6 h-[88vh] flex flex-col">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">📜 My Scripts</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {filtered.length} script{filtered.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={toneFilter}
              onChange={(e) => setToneFilter(e.target.value)}
              className="border p-1.5 rounded-lg text-xs bg-gray-50 text-gray-600"
            >
              <option value="All">All tones</option>
              <option>Professional</option>
              <option>Motivational</option>
              <option>Funny</option>
            </select>

            <select
              value={lengthFilter}
              onChange={(e) => setLengthFilter(e.target.value)}
              className="border p-1.5 rounded-lg text-xs bg-gray-50 text-gray-600"
            >
              <option value="All">All lengths</option>
              <option>Short</option>
              <option>Medium</option>
              <option>Long</option>
            </select>

            <div className="ml-auto flex gap-1.5">
              <button
                onClick={() => setShowFavorites(false)}
                className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                  !showFavorites
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setShowFavorites(true)}
                className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                  showFavorites
                    ? "bg-yellow-400 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                ⭐ Favorites
              </button>
            </div>
          </div>

          {/* SCRIPT LIST */}
          <div className="overflow-y-auto flex-1 space-y-3 pr-1">

            {/* EMPTY STATE */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm font-medium text-gray-500">No scripts found</p>
                <p className="text-xs mt-1 text-center">
                  {showFavorites
                    ? "You haven't favorited any scripts yet."
                    : "Generate your first script to see it here."}
                </p>
              </div>
            )}

            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ delay: i * 0.04 }}
                  className="border p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  {/* CLICK TO LOAD INTO GENERATOR */}
                  <div
                    onClick={() => setScript(item.content)}
                    className="cursor-pointer"
                  >
                    <p className="font-semibold text-sm truncate">{item.topic}</p>

                    {/* BADGES */}
                    <div className="flex gap-1.5 mt-1 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TONE_STYLES[item.tone] || "bg-gray-100 text-gray-600"}`}>
                        {item.tone}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">
                        {item.length}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  {/* FOOTER */}
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFavorite(item._id)}
                        className="text-base hover:scale-110 transition-transform"
                      >
                        {item.isFavorite ? "⭐" : "☆"}
                      </button>
                      <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelected(item)}
                        className="text-xs px-2.5 py-1 border rounded-lg hover:bg-white transition text-gray-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-xs px-2.5 py-1 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
              className="w-full mt-6 border p-4 h-64 rounded-lg resize-none"
              value={script}
              readOnly
            />
          )}

        </div>
      </motion.div>

      {/* ================= MODAL VIEWER ================= */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold pr-4">{selected.topic}</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* BADGES */}
              <div className="flex gap-2 mb-5 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TONE_STYLES[selected.tone] || "bg-gray-100 text-gray-600"}`}>
                  {selected.tone}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                  {selected.length}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 ml-auto">
                  {formatDate(selected.createdAt)}
                </span>
              </div>

              {/* CONTENT */}
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                {selected.content}
              </pre>

              {/* MODAL FOOTER */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <button
                  onClick={() => handleFavorite(selected._id)}
                  className="text-sm text-gray-500 hover:text-yellow-500 transition"
                >
                  {selected.isFavorite ? "⭐ Favorited" : "☆ Add to favorites"}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setScript(selected.content);
                      setSelected(null);
                    }}
                    className="text-sm px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Load in Generator
                  </button>
                  <button
                    onClick={() => handleDelete(selected._id)}
                    className="text-sm px-4 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScriptGenerator;