import { useEffect, useState } from "react";
import SoftBackdrop from "../components/SoftBackdrop";
import { type IThumbnail } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRightIcon, DownloadIcon, TrashIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../configs/api";
import toast from "react-hot-toast";

const MyGeneration = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [thumbnails, setThumbnails] = useState<IThumbnail[]>([]);
  const [loading, setLoading] = useState(false);

  // Force refresh every minute for timeAgo updates
  const [, setTick] = useState(0);

  const aspectRatioClassMap: Record<string, string> = {
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "9:16": "aspect-[9/16]",
  };

  /* ---------------- AUTO UPDATE TIME ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);


    return () => clearInterval(interval);

  }, []);

  /* ---------------- TIME AGO FUNCTION ---------------- */
  const timeAgo = (date?: string | Date) => {
    if (!date) return "";


    const past = new Date(date);
    if (isNaN(past.getTime())) return "";

    const now = new Date();
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.max(1, Math.floor(seconds / 60));
    if (minutes < 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7)
      return `${days} day${days > 1 ? "s" : ""} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4)
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);
    if (months < 12)
      return `${months} month${months > 1 ? "s" : ""} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;


  };

  /* ---------------- FETCH THUMBNAILS ---------------- */
  const fetchThumbnails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/user/thumbnails");
      setThumbnails(data?.thumbnails || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DOWNLOAD ---------------- */
  const handleDownload = (image_url?: string) => {
    if (!image_url) return;


    const link = document.createElement("a");
    link.href = image_url.replace("/upload", "/upload/fl_attachment");
    document.body.appendChild(link);
    link.click();
    link.remove();


  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this thumbnail?"
    );
    if (!confirmDelete) return;


    try {
      const { data } = await api.delete(`/api/thumbnail/delete/${id}`);
      toast.success(data.message);

      setThumbnails((prev) => prev.filter((thumb) => thumb._id !== id));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }


  };

  useEffect(() => {
    if (isLoggedIn) fetchThumbnails();
    else setThumbnails([]);
  }, [isLoggedIn]);

  return (
    <> <SoftBackdrop />


      <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-10 bg-white min-h-screen">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-black">My Generations</h1>
          <p className="text-gray-500 mt-2">
            View and manage all your AI-generated thumbnails
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-gray-100 border animate-pulse h-[260px]"
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && thumbnails.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold">No thumbnails yet</h3>
            <p className="text-gray-500 mt-2">
              Generate your first thumbnail to see it here
            </p>
          </div>
        )}

        {/* GRID */}
        {!loading && thumbnails.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {thumbnails.map((thumb) => {
              const aspectClass =
                aspectRatioClassMap[thumb.aspect_ratio || "16:9"];

              return (
                <div
                  key={thumb._id}
                  onClick={() => navigate(`/generate/${thumb._id}`)}
                  className="group relative cursor-pointer rounded-2xl bg-white border shadow-sm hover:shadow-xl transition"
                >
                  {/* IMAGE */}
                  <div
                    className={`relative overflow-hidden rounded-t-2xl ${aspectClass} bg-gray-100`}
                  >
                    {thumb.image_url ? (
                      <img
                        src={thumb.image_url}
                        alt={thumb.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        {thumb.isGenerating ? "Generating…" : "No image"}
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-semibold line-clamp-2">
                      {thumb.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                        {thumb.style}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                        {thumb.color_scheme}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600">
                        {thumb.aspect_ratio}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">
                      {timeAgo(thumb.createdAt)}
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-3 right-3 hidden group-hover:flex gap-2"
                  >
                    <TrashIcon
                      onClick={() => handleDelete(thumb._id)}
                      className="size-7 p-1 bg-white border rounded hover:bg-red-500 hover:text-white transition"
                    />

                    <DownloadIcon
                      onClick={() => handleDownload(thumb.image_url)}
                      className="size-7 p-1 bg-white border rounded hover:bg-blue-600 hover:text-white transition"
                    />

                    <Link
                      target="_blank"
                      to={`/preview?thumbnail_url=${thumb.image_url}&title=${thumb.title}`}
                    >
                      <ArrowUpRightIcon className="size-7 p-1 bg-white border rounded hover:bg-blue-600 hover:text-white transition" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>


  );
};

export default MyGeneration;
