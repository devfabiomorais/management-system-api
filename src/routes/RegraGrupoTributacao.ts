import express from 'express';
const router = express.Router();

import {
  getAllRegraGrupoTributacao,
  registerRegraGrupoTributacao,
} from '../controllers/RegraGrupoTributacaoController.js';

import auth from '../middleware/auth.js';

router.post('/register', auth, registerRegraGrupoTributacao);
// router.put('/edit/:id', auth, updateGrupoTributario);
// router.delete('/:id', auth, deleteGrupoTributario);
// router.put('/cancel/:id', auth, cancelarGrupoTributario);
router.get('/', auth, getAllRegraGrupoTributacao);

export default router;
