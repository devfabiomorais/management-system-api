import express from 'express';
const router = express.Router();
import { pedidoGerado, getCanaisVenda, cancelarOrcamento, getAllOrcamentos, deleteOrcamento, updateOrcamento, registerOrcamento } from '../controllers/orcamentosController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerOrcamento);
router.delete('/:id', auth, deleteOrcamento);
router.put('/edit/:id', auth, updateOrcamento);
router.put('/cancel/:id', auth, cancelarOrcamento);
router.put('/pedido_gerado/:id', auth, pedidoGerado);
router.get('/', auth, getAllOrcamentos);
router.get("/canais-venda", getCanaisVenda);

export default router;
