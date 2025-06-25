import express from 'express';
const router = express.Router();

import {
  registerContaFinanceiro,
  getAllContasFinanceiro,
  updateContaFinanceiro,
  cancelContaFinanceiro
} from '../controllers/contasFinanceiroController.js';

import auth from '../middleware/auth.js';

// Rotas protegidas por autenticação
router.post('/register', auth, registerContaFinanceiro);
router.put('/edit', auth, updateContaFinanceiro);
router.get('/', auth, getAllContasFinanceiro);
router.put('/cancel/:id', auth, cancelContaFinanceiro);

export default router;
