import express from 'express';
const router = express.Router();

import {
  getAllGruposTributarios,
  registerGrupoTributario,
  updateGrupoTributario,
  cancelarGrupoTributario
} from '../controllers/gruposTributacaoController.js';

import auth from '../middleware/auth.js';

router.post('/register', auth, registerGrupoTributario);
router.put('/edit/:id', auth, updateGrupoTributario);
// router.delete('/:id', auth, deleteGrupoTributario);
router.put('/cancel/:id', auth, cancelarGrupoTributario);
router.get('/', auth, getAllGruposTributarios);

export default router;
