import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../configs/api";
import SoftBackdrop from "../components/SoftBackdrop";
import { DownloadIcon, TrashIcon } from "lucide-react";

type Video = {
    _id: string;
    title: string;
    style: string;
    aspect_ratio: string;
    duration: number;
    video_url?: string;
    isGenerating: boolean;
    error?: string;
    createdAt: string;
};

const styleColors: Record<string, string> = {
    Cinematic: "bg-blue-50 text-blue-600",
    Documentary: "bg-green-50 text-green-600",
    Animated: "bg-pink-50 text-pink-600",
    Commercial: "bg-yellow-50 text-yellow-600",
    Dramatic: "bg-red-50 text-red-600",
};

const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const minutes = Math.max(1, Math.floor(seconds / 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const VideoCard = ({ video, onDelete }: { video: Video; onDelete: (id: string) => void }) => {
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
            return;
        }
        setDeleting(true);
        try {
            await api.delete(`/api/video/${video._id}`);
            onDelete(video._id);
        } catch {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    const handleDownload = () => {
        if (!video.video_url) return;
        const link = document.createElement("a");
        link.href = video.video_url;
        link.download = `${video.title}.mp4`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="group relative bg-white border rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden">
            {/* Video / Placeholder */}
            <div className="relative bg-gray-100 aspect-video overflow-hidden rounded-t-2xl">
                {video.video_url ? (
                    <video
                        src={video.video_url}
                        controls
                        loop
                        className="w-full h-full object-cover"
                    />
                ) : video.isGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Generating...</p>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-xs text-red-500 text-center line-clamp-3">{video.error || "Generation failed"}</p>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-black line-clamp-2">{video.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded ${styleColors[video.style] ?? "bg-gray-100 text-gray-600"}`}>
                        {video.style}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">{video.aspect_ratio}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">{video.duration}s</span>
                </div>
                <p className="text-xs text-gray-400">{timeAgo(video.createdAt)}</p>
            </div>

            {/* Hover Actions */}
            <div
                className="absolute bottom-3 right-3 hidden group-hover:flex gap-2"
                onClick={(e) => e.stopPropagation()}
            >
                {video.video_url && (
                    <button
                        onClick={handleDownload}
                        className="size-7 p-1 bg-white border rounded hover:bg-blue-600 hover:text-white transition flex items-center justify-center"
                    >
                        <DownloadIcon className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`size-7 p-1 border rounded transition flex items-center justify-center ${
                        confirmDelete
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-white hover:bg-red-500 hover:text-white"
                    }`}
                    title={confirmDelete ? "Click again to confirm" : "Delete"}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const MyVideos = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<"all" | "ready" | "generating" | "failed">("all");

    useEffect(() => {
        api.get<{ videos: Video[] }>("/api/video")
            .then(({ data }) => setVideos(data.videos))
            .catch(() => setError("Failed to load videos"))
            .finally(() => setLoading(false));
    }, []);

    // Poll generating videos every 10s
    useEffect(() => {
        const generatingIds = videos.filter((v) => v.isGenerating).map((v) => v._id);
        if (generatingIds.length === 0) return;
        const interval = setInterval(async () => {
            const updates = await Promise.allSettled(
                generatingIds.map((id) => api.get(`/api/video/status/${id}`))
            );
            setVideos((prev) =>
                prev.map((v) => {
                    const idx = generatingIds.indexOf(v._id);
                    if (idx === -1) return v;
                    const result = updates[idx];
                    return result.status === "fulfilled" ? { ...v, ...result.value.data } : v;
                })
            );
        }, 10000);
        return () => clearInterval(interval);
    }, [videos]);

    const handleDelete = (id: string) => setVideos((prev) => prev.filter((v) => v._id !== id));

    const filtered = videos.filter((v) => {
        if (filter === "ready") return !!v.video_url;
        if (filter === "generating") return v.isGenerating;
        if (filter === "failed") return !v.isGenerating && !v.video_url;
        return true;
    });

    const counts = {
        all: videos.length,
        ready: videos.filter((v) => !!v.video_url).length,
        generating: videos.filter((v) => v.isGenerating).length,
        failed: videos.filter((v) => !v.isGenerating && !v.video_url).length,
    };

    return (
        <>
            <SoftBackdrop />
            <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-10 bg-white min-h-screen">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-black">My Videos</h1>
                        <p className="text-gray-500 mt-2">View and manage all your AI-generated videos</p>
                    </div>
                    <Link
                        to="/video-generator"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                    >
                        + New Video
                    </Link>
                </div>

                {/* Filters */}
                {videos.length > 0 && (
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {(["all", "ready", "generating", "failed"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                                    filter === f
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                            >
                                {f} ({counts[f]})
                            </button>
                        ))}
                    </div>
                )}

                {/* Loading skeletons */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-gray-100 border animate-pulse h-[260px]" />
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="text-center py-20 text-red-500">{error}</div>
                )}

                {/* Empty state */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-lg font-semibold text-black">
                            {filter === "all" ? "No videos yet" : `No ${filter} videos`}
                        </h3>
                        {filter === "all" && (
                            <>
                                <p className="text-gray-500 mt-2">Generate your first video to see it here</p>
                                <Link
                                    to="/video-generator"
                                    className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium transition"
                                >
                                    Generate your first video →
                                </Link>
                            </>
                        )}
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((video) => (
                            <VideoCard key={video._id} video={video} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default MyVideos;