import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function BlogGenerator() {

const [topic, setTopic] = useState("");
const [tone, setTone] = useState("Professional");
const [words, setWords] = useState(600);
const [blog, setBlog] = useState("");
const [loading, setLoading] = useState(false);

const generateBlog = async () => {
if (!topic) return;


setLoading(true);

const res = await fetch("http://localhost:3000/api/blog/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    topic,
    tone,
    words
  })
});

const data = await res.json();

if (data.success) {
  setBlog(data.blog);
}

setLoading(false);


};

const copyBlog = () => {
navigator.clipboard.writeText(blog);
alert("Blog copied!");
};

const wordCount = blog.split(" ").filter(Boolean).length;

return ( <div className="pt-28 px-6 md:px-20 max-w-6xl mx-auto">


  <h1 className="text-4xl font-bold mb-8">
    AI Blog Generator
  </h1>

  {/* INPUTS */}

  <div className="grid md:grid-cols-3 gap-4 mb-6">

    <input
      type="text"
      placeholder="Enter blog topic..."
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
      className="border p-3 rounded"
    />

    <select
      value={tone}
      onChange={(e) => setTone(e.target.value)}
      className="border p-3 rounded"
    >
      <option>Professional</option>
      <option>Casual</option>
      <option>Informative</option>
      <option>Storytelling</option>
      <option>Marketing</option>
    </select>

    <select
      value={words}
      onChange={(e) => setWords(Number(e.target.value))}
      className="border p-3 rounded"
    >
      <option value={400}>400 words</option>
      <option value={600}>600 words</option>
      <option value={800}>800 words</option>
      <option value={1000}>1000 words</option>
    </select>

  </div>

  {/* GENERATE BUTTON */}

  <button
    onClick={generateBlog}
    className="bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition"
  >
    {loading ? "Generating..." : "Generate Blog"}
  </button>

  {/* RESULT */}

  {blog && (
    <div className="mt-10">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          Generated Blog
        </h2>

        <div className="flex gap-4">

          <span className="text-gray-500">
            {wordCount} words
          </span>

          <button
            onClick={copyBlog}
            className="bg-black text-white px-4 py-1 rounded"
          >
            Copy
          </button>

        </div>
      </div>

      {/* SCROLLABLE BLOG BOX */}

      <div className="bg-gray-50 border rounded-lg p-6 prose max-w-none max-h-[70vh] overflow-y-auto">
        <ReactMarkdown>
          {blog}
        </ReactMarkdown>
      </div>

    </div>
  )}

</div>


);
}
