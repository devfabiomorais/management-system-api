import express from 'express';
const router = express.Router();
import { getAllServicos, deleteServico, updateServico, registerServico, cancelarServico } from '../controllers/servicosController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerServico);
router.delete('/:id', auth, deleteServico);
router.put('/cancel/:id', auth, cancelarServico);
router.put('/edit/:id', auth, updateServico);
router.get('/', auth, getAllServicos);

export default router;
