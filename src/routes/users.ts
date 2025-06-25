import express from 'express';
const router = express.Router();
import { SendCode, updatePassword, validateCode, createUser, updateUser, getUsers, deleteUser, cancelarUser } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

router.get('/', getUsers);
router.delete('/:id', auth, deleteUser);
router.put('/edit/:id', auth, updateUser);
router.post('/register', auth, createUser);
router.post('/sendCode', SendCode);
router.post('/checkCode', validateCode);
router.put('/cancel/:id', auth, cancelarUser);
router.put('/changePassword/:id', updatePassword);
//router.delete('/:id', auth, deleteUser);

export default router;
