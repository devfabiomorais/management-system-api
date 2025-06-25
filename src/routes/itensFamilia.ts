import express from 'express';
const router = express.Router();
import { getAllFamilies, deleteFamily, updateFamily, registerFamily, cancelarFamily } from '../controllers/familiaItensController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerFamily);
router.delete('/:id', auth, deleteFamily);
router.put('/edit/:id', auth, updateFamily);
router.put('/cancel/:id', auth, cancelarFamily);
router.get('/', auth, getAllFamilies);

export default router;
