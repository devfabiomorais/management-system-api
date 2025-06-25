import express from 'express';
const router = express.Router();
import { getAllPedidosVenda, cancelarPedidoVenda, registerPedidoVenda } from '../controllers/pedidosVendaController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerPedidoVenda);
// router.delete('/:id', auth, deleteServico);
router.put('/cancel/:id', auth, cancelarPedidoVenda);
// router.put('/edit/:id', auth, updateServico);
router.get('/', auth, getAllPedidosVenda);

export default router;
