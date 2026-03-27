import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  colorSchemes,
  type AspectRatio,
  type IThumbnail,
  type ThumbnailStyle,
} from '../assets/assets';

import SoftBackdrop from '../components/SoftBackdrop';
import AspectRatioSelector from '../components/AspectRatioSelector';
import StyleSelector from '../components/StyleSelector';
import ColorSchemeSelector from '../components/ColorSchemeSelector';
import PreviewPanel from '../components/PreviewPanel';

import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../configs/api';

const Generate = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // ✅ FIXED AUTH
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;

  const [title, setTitle] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  const [thumbnail, setThumbnail] = useState<IThumbnail | null>(null);
  const [loading, setLoading] = useState(false);

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [colorSchemeId, setColorSchemeId] = useState<string>(colorSchemes[0].id);
  const [style, setStyle] = useState<ThumbnailStyle>('Bold & Graphic');

  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

  // ✅ GENERATE HANDLER
  const handleGenerate = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return toast.error('Please login first');
    }

    if (!title.trim()) return toast.error('Title is required');

    setLoading(true);

    try {
      const { data } = await api.post('/api/thumbnail/generate', {
        title,
        prompt: additionalDetails,
        style,
        aspect_ratio: aspectRatio,
        color_scheme: colorSchemeId,
        text_overlay: true,
      });

      if (data.thumbnail) {
        navigate('/generate/' + data.thumbnail._id);
        toast.success(data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH EXISTING THUMBNAIL
  const fetchThumbnail = async () => {
    try {
      const { data } = await api.get(`/api/user/thumbnail/${id}`);
      const thumb = data?.thumbnail;

      setThumbnail(thumb);
      setLoading(!thumb?.image_url);
      setAdditionalDetails(thumb?.user_prompt);
      setTitle(thumb?.title);
      setColorSchemeId(thumb?.color_scheme);
      setAspectRatio(thumb?.aspect_ratio);
      setStyle(thumb?.style);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // ✅ FETCH LOOP
  useEffect(() => {
    if (!authLoading && isLoggedIn && id) {
      fetchThumbnail();
    }

    if (id && loading && isLoggedIn) {
      const interval = setInterval(fetchThumbnail, 5000);
      return () => clearInterval(interval);
    }
  }, [id, loading, isLoggedIn, authLoading]);

  // ✅ RESET WHEN ROUTE CHANGES
  useEffect(() => {
    if (!id) setThumbnail(null);
  }, [pathname]);

  // ✅ SAFE AUTH REDIRECT
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading]);

  // ✅ LOADING STATE
  if (authLoading) return <div className="pt-24 text-center">Loading...</div>;

  return (
    <>
      <SoftBackdrop />

      <div className="pt-24 min-h-screen bg-white">
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[400px_1fr] gap-8">

            {/* LEFT PANEL */}
            <div className={`space-y-6 ${id && 'pointer-events-none'}`}>
              <div className="p-6 rounded-2xl border shadow-lg space-y-6">

                <h2 className="text-xl font-bold">Create Your Thumbnail</h2>

                {/* INPUT */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="w-full p-3 border rounded"
                />

                <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                <StyleSelector
                  value={style}
                  onChange={setStyle}
                  isOpen={styleDropdownOpen}
                  setIsOpen={setStyleDropdownOpen}
                />
                <ColorSchemeSelector value={colorSchemeId} onChange={setColorSchemeId} />

                <textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Additional details"
                  className="w-full p-3 border rounded"
                />

                {!id && (
                  <button
                    onClick={handleGenerate}
                    className="w-full py-3 bg-blue-600 text-white rounded"
                  >
                    {loading ? 'Generating...' : 'Generate'}
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div>
              <PreviewPanel
                thumbnail={thumbnail}
                isLoading={loading}
                aspectRatio={aspectRatio}
              />
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default Generate;