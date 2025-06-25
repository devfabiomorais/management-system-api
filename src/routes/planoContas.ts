import express from 'express';
const router = express.Router();
import { getAllPlanoContas, deletePlanoContas, updatePlanoContas, registerPlanoContas, cancelarPlanoContas } from '../controllers/planoContasController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerPlanoContas);
router.delete('/:id', auth, deletePlanoContas);
router.put('/cancel/:id', auth, cancelarPlanoContas);
router.put('/edit/:id', auth, updatePlanoContas);
router.get('/', auth, getAllPlanoContas);

export default router;
