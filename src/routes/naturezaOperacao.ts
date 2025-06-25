import express from 'express';
const router = express.Router();

import {
  getAllNaturezasOperacao,
  registerNaturezaOperacao,
  updateNaturezaOperacao,
  cancelNatureza
} from '../controllers/naturezaOperacao.js';

import auth from '../middleware/auth.js';

router.post('/register', auth, registerNaturezaOperacao);
router.put('/edit/:id', auth, updateNaturezaOperacao);
router.put('/cancel/:id', auth, cancelNatureza);
router.get('/', auth, getAllNaturezasOperacao);

export default router;
