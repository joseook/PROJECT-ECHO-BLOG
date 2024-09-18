import { Router } from 'express';
import { getAllPost, createPost, getPostById, updatePost, deletePost, uploadImage } from '../controller/postController.js';
import { authenticateToken, roleAuthorizationProfile } from '../auth/authMiddleware.js';
const router = Router();

router.use(authenticateToken);

router.get('/', getAllPost);
router.post('/', roleAuthorizationProfile(["administrador", "autor"]), createPost);
router.post('/:id/imagem', roleAuthorizationProfile(["administrador", "autor"]), uploadImage);
router.get('/:id', getPostById);
router.put('/:id', roleAuthorizationProfile(["administrador", "autor"]), updatePost);
router.delete('/:id', roleAuthorizationProfile(["administrador", "autor"]), deletePost);
router.post("/:postagemId/curtidas", toggleLike);

export default router;
