import { Router } from 'express';
import {
    registerUser,
    loginUser,
    updateUserProfile,
    listUsers,
    deleteUser,
    updateUserRole,
} from '../controller/userController.js';
import { authenticateToken, roleAuthorizationProfile } from '../auth/authMiddleware.js';

const router = Router();

router.post('/registro', registerUser);
router.post('/login', loginUser);
router.put('/usuario/:id', authenticateToken, updateUserProfile);
router.get('/adm/dashboard', authenticateToken, roleAuthorizationProfile(['administrador']), listUsers);
router.delete('/usuario/:id', authenticateToken, roleAuthorizationProfile(['administrador']), deleteUser);
router.patch('/adm/:id/papel', authenticateToken, roleAuthorizationProfile(['administrador']), updateUserRole);

export default router;
