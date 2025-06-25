import express from 'express';
const router = express.Router();

import {
  getAllMovimentacoes,
  registerMovimentacao,
  updateMovimentacao,
  deleteMovimentacao,
  cancelMovimentacao,
  getMovimentacaoById
} from '../controllers/movimentacoesController.js';

import auth from '../middleware/auth.js';

// Rotas protegidas com autenticação
router.post('/register', auth, registerMovimentacao);
router.put('/edit/:id', auth, updateMovimentacao);
router.put('/cancel/:id', auth, cancelMovimentacao);
router.delete('/delete/:id', auth, deleteMovimentacao);
router.get('/:id', auth, getMovimentacaoById);
router.get('/', auth, getAllMovimentacoes);

export default router;
