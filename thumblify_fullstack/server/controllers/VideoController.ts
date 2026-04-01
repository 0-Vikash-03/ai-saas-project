import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import Video from '../models/Video.js';
import ai from '../configs/ai.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config(process.env.CLOUDINARY_URL as string);

/* ================= STYLE PROMPTS ================= */

const videoStylePrompts: Record<string, string> = {
  'Cinematic': 'high quality footage, dramatic natural lighting, wide angle shot, professional color grading',
  'Documentary': 'natural lighting, realistic and authentic footage, observational style',
  'Animated': 'vibrant colors, smooth motion, stylized visual style',
  'Commercial': 'clean lighting, professional production quality, polished visuals',
  'Dramatic': 'high contrast lighting, intense mood, cinematic composition',
};

const VALID_STYLES = Object.keys(videoStylePrompts);
const VALID_ASPECT_RATIOS = ['16:9', '9:16', '1:1'];
const VALID_DURATIONS = [4, 6, 8];

/* ================= BACKGROUND GENERATION ================= */

async function runVideoGeneration(
  videoId: string,
  prompt: string,
  aspect_ratio: string,
  duration: number,
  negative_prompt?: string
) {
  const video = await Video.findById(videoId);
  if (!video) return;

  try {
    let operation: any = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt,
      config: {
        aspectRatio: aspect_ratio,
        durationSeconds: duration,
        ...(negative_prompt ? { negativePrompt: negative_prompt } : {}),
      },
    });

    console.log(`[Video ${videoId}] Generation started:`, operation.name);

    const MAX_POLLS = 30;
    let polls = 0;

    while (!operation.done && polls < MAX_POLLS) {
      await new Promise((r) => setTimeout(r, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
      polls++;
      console.log(`[Video ${videoId}] Poll ${polls}/${MAX_POLLS}, done: ${operation.done}`);
    }

    if (!operation.done) {
      video.isGenerating = false;
      video.error = 'Video generation timed out. Please try again.';
      await video.save();
      return;
    }

    // Check content filter
    const filteredCount = operation.response?.raiMediaFilteredCount;
    const filteredReasons = operation.response?.raiMediaFilteredReasons;

    if (filteredCount && filteredCount > 0) {
      video.isGenerating = false;
      video.error = `Prompt blocked by Google content filter. Reason: ${filteredReasons?.[0] || 'Content policy violation'}. Try a different prompt without brand names or copyrighted content.`;
      await video.save();
      return;
    }

    const generatedVideos =
      operation.response?.generatedVideos ||
      operation.result?.generatedVideos ||
      operation.videos ||
      operation.generatedVideos ||
      [];

    if (!generatedVideos[0]) {
      video.isGenerating = false;
      video.error = 'No video was generated. Please try a different prompt.';
      await video.save();
      return;
    }

    const generatedVideo = generatedVideos[0];
    const videoBytes =
      generatedVideo.video?.videoBytes ||
      generatedVideo.video?.uri ||
      generatedVideo.videoBytes ||
      generatedVideo.uri ||
      null;

    if (!videoBytes) throw new Error('No video bytes found in response');

    let uploadResult: any;

    if (typeof videoBytes === 'string' && videoBytes.startsWith('http')) {
      const googleUrl = `${videoBytes}&key=${process.env.GEMINI_API_KEY}`;
      const response = await fetch(googleUrl);
      if (!response.ok) throw new Error(`Failed to download video: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const base64Video = `data:video/mp4;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
      uploadResult = await cloudinary.uploader.upload(base64Video, {
        resource_type: 'video',
        folder: 'generated_videos',
      });
    } else {
      const base64Video = `data:video/mp4;base64,${Buffer.from(videoBytes).toString('base64')}`;
      uploadResult = await cloudinary.uploader.upload(base64Video, {
        resource_type: 'video',
        folder: 'generated_videos',
      });
    }

    video.video_url = uploadResult.secure_url;
    video.isGenerating = false;
    await video.save();

    console.log(`[Video ${videoId}] Done! URL: ${uploadResult.secure_url}`);

  } catch (err: any) {
    console.error(`[Video ${videoId}] Error:`, err);
    video.isGenerating = false;
    video.error = err.message || 'Unknown error during generation';
    await video.save();
  }
}

/* ================= GENERATE ================= */

export const generateVideo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio = '16:9',
      duration = 8,
      negative_prompt,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (style && !VALID_STYLES.includes(style)) {
      return res.status(400).json({ message: `Invalid style. Must be one of: ${VALID_STYLES.join(', ')}` });
    }
    if (!VALID_ASPECT_RATIOS.includes(aspect_ratio)) {
      return res.status(400).json({ message: `Invalid aspect ratio. Must be one of: ${VALID_ASPECT_RATIOS.join(', ')}` });
    }
    if (!VALID_DURATIONS.includes(Number(duration))) {
      return res.status(400).json({ message: `Invalid duration. Must be one of: ${VALID_DURATIONS.join(', ')}` });
    }

    const video = await Video.create({
      userId,
      title,
      user_prompt,
      style,
      aspect_ratio,
      duration: Number(duration),
      isGenerating: true,
    });

    const styleDesc = videoStylePrompts[style] ?? '';
    let prompt = `${styleDesc ? styleDesc + ' — ' : ''}${title}`;
    if (user_prompt) prompt += `. ${user_prompt}`;
    prompt += '. High quality, smooth motion, visually stunning.';

    // Fire and forget — runs in background
    runVideoGeneration(String(video._id), prompt, aspect_ratio, Number(duration), negative_prompt);

    return res.status(202).json({ message: 'Video generation started', videoId: video._id });

  } catch (error: any) {
    console.error('generateVideo error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/* ================= GET STATUS ================= */

export const getVideoStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const video = await Video.findOne({ _id: id, userId: req.userId });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    return res.json({
      videoId: video._id,
      isGenerating: video.isGenerating,
      video_url: video.video_url,
      error: video.error,
      title: video.title,
    });

  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE ================= */

export const deleteVideo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Video.findOneAndDelete({ _id: id, userId: req.userId });
    return res.json({ message: 'Video deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/* ================= GET USER VIDEOS ================= */

export const getUserVideos = async (req: AuthRequest, res: Response) => {
  try {
    const videos = await Video.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json({ videos });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};