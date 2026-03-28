import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import Thumbnail from '../models/Thumbnail.js';
import {
  GenerateContentConfig,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/genai';
import ai from '../configs/ai.js';
import { v2 as cloudinary } from 'cloudinary';

/* ================= SAFE INPUT ================= */

function sanitizeInput(text: string) {
  if (!text) return '';

  return text
    .replace(/(blood|kill|murder|violence|nude|sex|terror|attack)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ================= CONTROLLER ================= */

export const generateThumbnail = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    const safeUserPrompt = sanitizeInput(user_prompt || '');

    /* ================= CREATE DB ENTRY ================= */

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: safeUserPrompt,
      user_prompt: safeUserPrompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    /* ================= AI CONFIG ================= */

    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 8192,
      temperature: 0.9,
      topP: 0.95,
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: aspect_ratio || '16:9',
        imageSize: '1K',
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    };

    /* ================= PROMPT ================= */

    let prompt = `Create a YouTube thumbnail for: "${title}".`;

    if (style) prompt += ` Style: ${style}.`;
    if (color_scheme) prompt += ` Color theme: ${color_scheme}.`;
    if (safeUserPrompt) prompt += ` Details: ${safeUserPrompt}.`;

    prompt += ` Clean, high quality, modern YouTube thumbnail.`;

    /* ================= GENERATE ================= */

    const response: any = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [prompt],
      config: generationConfig,
    });

    const candidate = response?.candidates?.[0];

    if (!candidate?.content?.parts) {
      throw new Error('No image generated');
    }

    let buffer: Buffer | null = null;

    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        buffer = Buffer.from(part.inlineData.data, 'base64');
        break;
      }
    }

    if (!buffer) throw new Error('Image generation failed');

    /* ================= CLOUDINARY ================= */

    const upload = await cloudinary.uploader.upload(
      `data:image/png;base64,${buffer.toString('base64')}`
    );

    /* ================= SAVE ================= */

    thumbnail.image_url = upload.secure_url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    return res.json({
      success: true,
      message: 'Thumbnail generated successfully',
      thumbnail,
    });

  } catch (error: any) {
    console.error('generateThumbnail error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
};

/* ================= DELETE ================= */

export const deleteThumbnail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    await Thumbnail.findOneAndDelete({ _id: id, userId });

    res.json({
      success: true,
      message: 'Thumbnail deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};