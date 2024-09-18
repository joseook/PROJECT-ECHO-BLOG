// Import necessary dependencies
import { Router } from 'express';
import { authenticateToken } from '../auth/authMiddleware.js';
import {
    createCommentsForPost,
    editComment,
    deleteComment,
    getCommentsForPost
} from '../controller/commentsController.js';

const router = Router();

router.use(authenticateToken);

router.get("/:postagemId/comentarios", getCommentsForPost);
router.post("/:postagemId/comentarios", createCommentsForPost);
router.put("/comentarios/:comentarioId", editComment);
router.delete("/comentarios/:comentarioId", deleteComment);

export default router;
