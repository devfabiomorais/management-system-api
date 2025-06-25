import express from 'express';
const router = express.Router();
import { getAllFormasPgto, updateFormaPgto, deleteFormaPgto, registerFormaPgto, cancelarFormaPagamento } from '../controllers/formaspagamentoController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerFormaPgto);
router.delete('/:id', auth, deleteFormaPgto);
router.put('/edit/:id', auth, updateFormaPgto);
router.put('/cancel/:id', auth, cancelarFormaPagamento);
router.get('/', auth, getAllFormasPgto);

export default router;
