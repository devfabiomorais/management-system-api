import express from 'express';
const router = express.Router();

import {
  registerContasBancarias,
  updateContasBancarias,
  getAllContasBancarias,
  cancelarContasBancarias
} from '../controllers/contasBancariasController.js';

import auth from '../middleware/auth.js';

// Rotas protegidas por autenticação
router.post('/register', auth, registerContasBancarias);
router.put('/edit/:id', auth, updateContasBancarias);
router.get('/', auth, getAllContasBancarias);
router.put('/cancel/:id', auth, cancelarContasBancarias);

export default router;
