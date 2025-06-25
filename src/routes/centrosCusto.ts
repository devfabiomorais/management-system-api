import express from 'express';
const router = express.Router();
import { getAllCentrosCusto, deleteCentrosCusto, updateCentrosCusto, registerCentrosCusto, cancelarCentrosCusto } from '../controllers/centrosCustoController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerCentrosCusto);
router.delete('/:id', auth, deleteCentrosCusto);
router.put('/cancel/:id', auth, cancelarCentrosCusto);
router.put('/edit/:id', auth, updateCentrosCusto);
router.get('/', auth, getAllCentrosCusto);

export default router;
