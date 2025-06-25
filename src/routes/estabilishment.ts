import express from 'express';
const router = express.Router();
import { registerEstabilishment, deleteEstablishment, updateEstablishment, getAllEstablishments, cancelarEstablishment } from '../controllers/estabilishmentController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerEstabilishment);
router.delete('/:id', auth, deleteEstablishment);
router.put('/edit/:id', auth, updateEstablishment);
router.put('/cancel/:id', auth, cancelarEstablishment);
router.get('/', auth, getAllEstablishments);

export default router;
