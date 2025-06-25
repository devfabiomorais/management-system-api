import express from 'express';
const router = express.Router();
import { getAllTransportadoras, deleteTransportadora, updateTransportadora, registerTransportadora, cancelarTransportadora } from '../controllers/transportadorasController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerTransportadora);
router.delete('/:id', auth, deleteTransportadora);
router.put('/cancel/:id', auth, cancelarTransportadora);
router.put('/edit/:id', auth, updateTransportadora);
router.get('/', auth, getAllTransportadoras);

export default router;
