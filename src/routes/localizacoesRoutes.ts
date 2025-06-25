import express from 'express';
const router = express.Router();

import {
  getAllLocalizacoes,
  registerLocalizacao,
  updateLocalizacao,
  deleteLocalizacao,
  cancelLocalizacao
} from '../controllers/localizacoesController.js';

import auth from '../middleware/auth.js';

router.post('/register', auth, registerLocalizacao);
router.put('/edit/:id', auth, updateLocalizacao);
router.put('/cancel/:id', auth, cancelLocalizacao);
router.delete('/delete/:cod_localizacao', auth, deleteLocalizacao);
router.get('/', auth, getAllLocalizacoes);

export default router;
