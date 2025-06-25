import express from 'express';
const router = express.Router();

import {
  getAllAtividadesServicos,
  registerAtividadesServicos,
  updateAtividadesServicos,
  cancelAtividadeServico
} from '../controllers/atividadesServicos.js';

import auth from '../middleware/auth.js';

router.post('/register', auth, registerAtividadesServicos);
router.put('/edit/:id', auth, updateAtividadesServicos);
router.put('/cancel/:id', auth, cancelAtividadeServico);
router.get('/', auth, getAllAtividadesServicos);

export default router;
