import { Router } from 'express';
import { getAllPost, createPost, getPostById, updatePost, deletePost, uploadImage } from '../controller/postController.js';

const router = Router();

router.get('/', getAllPost);

router.post('/', createPost);

router.post('/:id/imagem', uploadImage);

router.get('/:id', getPostById);

router.put('/:id', updatePost);

router.delete('/:id', deletePost);

export default router;
