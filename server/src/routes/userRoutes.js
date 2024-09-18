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

router.use(authenticateToken);

router.post('/registro', registerUser);
router.post('/login', loginUser);
router.put('/usuario/:id', updateUserProfile);
router.get('/adm/dashboard', roleAuthorizationProfile(['administrador']), listUsers);
router.delete('/usuario/:id', roleAuthorizationProfile(['administrador']), deleteUser);
router.patch('/adm/:id/papel', roleAuthorizationProfile(['administrador']), updateUserRole);

export default router;
