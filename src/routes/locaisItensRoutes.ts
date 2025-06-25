import express from 'express';
const router = express.Router();

import {
  getAllLocaisItens,
  registerLocalItem,
  updateLocalItem,
  deleteLocalItem,
  cancelLocalItem,
  getLocalItemById
} from '../controllers/locaisItensController.js';

import auth from '../middleware/auth.js';

// Rotas protegidas com autenticação
router.post('/register', auth, registerLocalItem);
router.put('/edit/:id', auth, updateLocalItem);
router.put('/cancel/:id', auth, cancelLocalItem);
router.delete('/delete/:id', auth, deleteLocalItem);
router.get('/:id', auth, getLocalItemById);
router.get('/', auth, getAllLocaisItens);

export default router;
