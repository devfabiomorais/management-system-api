import express from 'express';
const router = express.Router();
import { getAllGruposDRE, registerGruposDRE } from '../controllers/grupoDREController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerGruposDRE);
// router.delete('/:id', auth, deleteGruposDRE);
// router.put('/cancel/:id', auth, cancelarGruposDRE);
// router.put('/edit/:id', auth, updateGruposDRE);
router.get('/', auth, getAllGruposDRE);

export default router;
