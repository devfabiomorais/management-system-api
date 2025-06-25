import express from 'express';
const router = express.Router();
import { getAllEstruturas, registerEstrutura, cancelarEstrutura, updateEstrutura } from '../controllers/estruturasController.js';
import auth from '../middleware/auth.js';

router.get('/', auth, getAllEstruturas);
router.post('/register', auth, registerEstrutura);
router.put('/cancel/:id', auth, cancelarEstrutura);
router.put('/edit/:id', auth, updateEstrutura);

export default router;
