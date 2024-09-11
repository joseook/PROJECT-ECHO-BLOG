import { Router } from 'express';
import {
    registerUser,
    loginUser,
    updateUserProfile,
    listUsers,
    deleteUser,
    updateUserRole,
} from '../controller/userController.js';
import { authenticateToken, authorizeRole } from '../auth/authMiddleware.js';

const router = Router();

router.post('/registro', registerUser);
router.post('/login', loginUser);
router.put('/usuario/:id', authenticateToken, updateUserProfile);
router.get('/', authenticateToken, authorizeRole(['administrador']), listUsers);
router.delete('/usuario/:id', authenticateToken, authorizeRole(['administrador']), deleteUser);
router.patch('/:id/papel', authenticateToken, authorizeRole(['administrador']), updateUserRole);

export default router;
