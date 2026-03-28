import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const ScriptGenerator = () => {
  const [topic, setTopic] = useState<string>("");
  const [tone, setTone] = useState<string>("Professional");
  const [length, setLength] = useState<string>("Medium");
  const [script, setScript] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleGenerate = async (): Promise<void> => {
    if (!topic) {
      alert("Please enter topic");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}/api/script/generate-script`,
        { topic, tone, length }
      );

      setScript(res.data.script);

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
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-800 mb-6 text-center"
        >
          🚀 AI Content Script Generator
        </motion.h2>

        {/* Topic Input */}
        <input
          type="text"
          placeholder="Enter video topic..."
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <select
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="Professional">Professional</option>
            <option value="Motivational">Motivational</option>
            <option value="Funny">Funny</option>
          </select>

          <select
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          >
            <option value="Short">Short</option>
            <option value="Medium">Medium</option>
            <option value="Long">Long</option>
          </select>
        </div>

        {/* Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-all shadow-md"
        >
          {loading ? "Generating Script..." : "Generate Script"}
        </motion.button>

        {/* Output */}
        {script && (
          <motion.textarea
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full mt-6 border border-gray-300 rounded-lg p-4 h-80 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={script}
            readOnly
          />
        )}
      </motion.div>
    </div>
  );
};

export default ScriptGenerator;