import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';
import {
  GenerateContentConfig,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/genai';
import ai from '../configs/ai.js';
import { v2 as cloudinary } from 'cloudinary';

/* ================= SAFE STYLE PROMPTS ================= */

const stylePrompts = {
  'Bold & Graphic':
    'high contrast thumbnail, bold typography, vibrant colors, expressive face, clean lighting, modern YouTube style',

  'Tech/Futuristic':
    'modern futuristic design, digital UI elements, soft glow effects, clean cyber aesthetic',

  'Minimalist':
    'clean minimalist design, simple layout, soft colors, clear focus',

  'Photorealistic':
    'realistic photo style, natural lighting, human-friendly expression, high clarity',

  'Illustrated':
    'digital illustration, colorful, friendly characters, clean vector style',
};

/* ================= COLOR SCHEMES ================= */

const colorSchemeDescriptions = {
  vibrant:
    'vibrant and energetic colors, high saturation, balanced contrast, eye-catching palette',

  sunset:
    'warm sunset tones, orange pink and purple hues, soft gradients',

  forest:
    'natural green tones, earthy colors, calm organic palette',

  neon:
    'neon glow accents, electric blue and pink tones, modern lighting',

  purple:
    'purple dominant palette with magenta and violet tones',

  monochrome:
    'black and white tones with clean contrast',

  ocean:
    'cool blue and teal tones, fresh clean look',

  pastel:
    'soft pastel colors, low saturation, gentle tones',
};

/* ================= INPUT SANITIZER ================= */

function sanitizeInput(text: string) {
  if (!text) return '';

  return text
    .replace(/(blood|kill|murder|violence|nude|sex|terror|attack)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ================= CONTROLLER ================= */

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;

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

    /* ================= GEMINI CONFIG ================= */

    const model = 'gemini-3.1-flash-image-preview';

    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 8192,
      temperature: 0.9,
      topP: 0.95,
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: aspect_ratio || '16:9',
        imageSize: '1K',
      },
      // Keep safety ON (recommended)
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

    /* ================= SAFE PROMPT BUILDER ================= */

    let prompt = `Create a YouTube thumbnail for the topic: "${title}".`;

    if (style) {
      prompt += ` Style: ${
        stylePrompts[style as keyof typeof stylePrompts]
      }.`;
    }

    if (color_scheme) {
      prompt += ` Colors: ${
        colorSchemeDescriptions[
          color_scheme as keyof typeof colorSchemeDescriptions
        ]
      }.`;
    }

    if (safeUserPrompt) {
      prompt += ` Include: ${safeUserPrompt}.`;
    }

    if (text_overlay) {
      prompt += ` Add clear readable text saying: "${text_overlay}".`;
    }

    prompt += ` The thumbnail should be clean, high quality, visually appealing, and suitable for general audiences.`;

    console.log('FINAL PROMPT:', prompt);

    /* ================= CALL GEMINI ================= */

    const response: any = await ai.models.generateContent({
      model,
      contents: [prompt],
      config: generationConfig,
    });

    const candidate = response?.candidates?.[0];

    /* ================= ERROR HANDLING ================= */

    if (!candidate) {
      throw new Error('No response from AI model');
    }

    if (candidate.finishReason === 'PROHIBITED_CONTENT') {
      thumbnail.isGenerating = false;
      await thumbnail.save();

      return res.status(400).json({
        success: false,
        message:
          'Your prompt was blocked by AI safety filters. Try simpler wording.',
      });
    }

    if (!candidate.content?.parts) {
      throw new Error('No content returned from model');
    }

    /* ================= EXTRACT IMAGE ================= */

    let finalBuffer: Buffer | null = null;

    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        finalBuffer = Buffer.from(part.inlineData.data, 'base64');
        break;
      }
    }

    if (!finalBuffer) {
      throw new Error('No image data found');
    }

    /* ================= UPLOAD TO CLOUDINARY ================= */

    const base64Image = `data:image/png;base64,${finalBuffer.toString(
      'base64'
    )}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
    });

    /* ================= SAVE RESULT ================= */

    thumbnail.image_url = uploadResult.secure_url;
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

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    await Thumbnail.findOneAndDelete({ _id: id, userId });

    res.json({
      success: true,
      message: 'Thumbnail deleted successfully',
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};