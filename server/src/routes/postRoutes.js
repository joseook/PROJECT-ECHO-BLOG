import express from 'express';
import { getAllPost, createPost, getPostById, updatePost, deletePost, uploadImage } from '../controllers/postController.js';

const router = express.Router();


router.get('/', getAllPost);

router.post('/', createPost);

router.get('/:id', getPostById);

router.put('/:id', updatePost);

router.delete('/:id', deletePost);

router.post('/:id/imagem', uploadImage);

export default router;
