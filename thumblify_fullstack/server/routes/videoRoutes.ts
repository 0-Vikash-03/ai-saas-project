import express from 'express';
import { generateVideo, deleteVideo, getUserVideos, getVideoStatus } from '../controllers/VideoController.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

router.post('/generate', protect, generateVideo);
router.get('/status/:id', protect, getVideoStatus);
router.get('/', protect, getUserVideos);
router.delete('/:id', protect, deleteVideo);

export default router;