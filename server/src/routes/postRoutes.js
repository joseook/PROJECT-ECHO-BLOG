import { Router } from 'express';
import { getAllPost, createPost, getPostById, updatePost, deletePost, uploadImage } from '../controller/postController.js';
import { authenticateToken, roleAuthorizationProfile } from '../auth/authMiddleware.js';
const router = Router();

router.get('/', getAllPost);

router.post('/', roleAuthorizationProfile(["administrador", "autor"]), createPost);

router.post('/:id/imagem', authenticateToken, roleAuthorizationProfile(["administrador", "autor"]), uploadImage);

router.get('/:id', authenticateToken, getPostById);

router.put('/:id', authenticateToken, roleAuthorizationProfile(["administrador", "autor"]), updatePost);

router.delete('/:id', authenticateToken, roleAuthorizationProfile(["administrador", "autor"]), deletePost);

export default router;
