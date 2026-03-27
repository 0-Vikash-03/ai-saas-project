import { useState, useEffect, useRef } from "react";
import api from "../configs/api";
import SoftBackdrop from "../components/SoftBackdrop";

const styles = ["Cinematic", "Documentary", "Animated", "Commercial", "Dramatic"];
const aspectRatios = [
    { label: "16:9", icon: "⬜", desc: "Landscape" },
    { label: "1:1", icon: "🟥", desc: "Square" },
    { label: "9:16", icon: "📱", desc: "Portrait" },
];

type VideoStatus = {
    videoId: string;
    isGenerating: boolean;
    video_url?: string;
    error?: string;
    title?: string;
};

const VideoGenerator = () => {
    const [form, setForm] = useState({
        title: "",
        prompt: "",
        style: "Cinematic",
        aspect_ratio: "16:9",
        duration: 8,
        negative_prompt: "",
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<VideoStatus | null>(null);
    const [error, setError] = useState("");
    const [elapsed, setElapsed] = useState(0);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = () => {
        if (pollRef.current) clearInterval(pollRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        pollRef.current = null;
        timerRef.current = null;
    };

    useEffect(() => () => stopPolling(), []);

    const startPolling = (videoId: string) => {
        setElapsed(0);
        timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
        pollRef.current = setInterval(async () => {
            try {
                const { data } = await api.get<VideoStatus>(`/api/video/status/${videoId}`);
                setStatus(data);
                if (!data.isGenerating) {
                    stopPolling();
                    setLoading(false);
                    if (data.error) setError(data.error);
                }
            } catch {
                stopPolling();
                setLoading(false);
                setError("Failed to get video status");
            }
        }, 8000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleGenerate = async () => {
        if (!form.title.trim()) return setError("Title is required");
        setError("");
        setLoading(true);
        setStatus(null);
        stopPolling();
        try {
            const { data } = await api.post<{ videoId: string }>("/api/video/generate", {
                ...form,
                duration: Number(form.duration),
            });
            startPolling(data.videoId);
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong");
            setLoading(false);
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const progressPct = Math.min((elapsed / 180) * 95, 95);

    return (
        <>
            <SoftBackdrop />
            <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-10 bg-white min-h-screen">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-black">Video Generator</h1>
                    <p className="text-gray-500 mt-2">Generate stunning AI videos powered by Google Veo</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* LEFT — Form */}
                    <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Video Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                maxLength={100}
                                placeholder="e.g. A sunset over the ocean"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                            <p className="text-xs text-gray-400 mt-1 text-right">{form.title.length}/100</p>
                        </div>

                        {/* Aspect Ratio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Aspect Ratio</label>
                            <div className="flex gap-3">
                                {aspectRatios.map((r) => (
                                    <button
                                        key={r.label}
                                        onClick={() => setForm({ ...form, aspect_ratio: r.label })}
                                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-medium transition ${
                                            form.aspect_ratio === r.label
                                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        <span className="text-lg">{r.icon}</span>
                                        <span>{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Style */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">Video Style</label>
                            <select
                                name="style"
                                value={form.style}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                            >
                                {styles.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">
                                Duration: <span className="text-black font-semibold">{form.duration}s</span>
                            </label>
                            <input
                                type="range"
                                name="duration"
                                min={4} max={8} step={2}
                                value={form.duration}
                                onChange={handleChange}
                                className="w-full accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>4s</span><span>6s</span><span>8s</span>
                            </div>
                        </div>

                        {/* Prompt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">Additional Details</label>
                            <textarea
                                name="prompt"
                                value={form.prompt}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Describe what you want in detail..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                            />
                        </div>

                        {/* Negative Prompt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1.5">Negative Prompt</label>
                            <input
                                name="negative_prompt"
                                value={form.negative_prompt}
                                onChange={handleChange}
                                placeholder="e.g. blurry, low quality, text"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Generating... ({formatTime(elapsed)})
                                </>
                            ) : "Generate Video"}
                        </button>
                    </div>

                    {/* RIGHT — Preview */}
                    <div className="bg-white border rounded-2xl shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-700 mb-4">Preview</h2>

                        {/* Generating state */}
                        {loading && (
                            <div className="space-y-4">
                                <div className="aspect-video bg-gray-50 border rounded-xl flex flex-col items-center justify-center gap-3">
                                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm text-gray-500">Generating your video...</p>
                                    <p className="text-xs text-gray-400 font-mono">{formatTime(elapsed)}</p>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 text-center">This takes 2–3 minutes. You can navigate away — we'll keep it running.</p>
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && !status?.video_url && (
                            <div className="aspect-video bg-gray-50 border rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400">
                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                </svg>
                                <p className="text-sm">Generate your first video</p>
                                <p className="text-xs">Fill out the form and click Generate</p>
                            </div>
                        )}

                        {/* Video ready */}
                        {status?.video_url && (
                            <div className="space-y-3">
                                <video
                                    src={status.video_url}
                                    controls
                                    autoPlay
                                    loop
                                    className="w-full rounded-xl border"
                                />
                                <a
                                    href={status.video_url}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium text-gray-700 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Video
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoGenerator;