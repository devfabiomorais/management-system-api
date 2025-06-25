import express from 'express';
const router = express.Router();
import { getAllUnits, deleteUnit, registerUnit, updateUnit, cancelarUnit } from '../controllers/unMedidaController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerUnit);
router.delete('/:id', auth, deleteUnit);
router.put('/edit/:id', auth, updateUnit);
router.put('/cancel/:id', auth, cancelarUnit);
router.get('/', auth, getAllUnits);

export default router;
