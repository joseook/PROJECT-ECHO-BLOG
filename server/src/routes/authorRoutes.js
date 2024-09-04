import { Router } from 'express';
import { createAuthor } from '../controller/authorController.js';

const router = Router();

router.post('/create', createAuthor);

export default router;
