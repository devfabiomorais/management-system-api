import express from 'express';
const router = express.Router();
import { getAllModules, deleteModule, updateModule, registerModule, cancelarModule } from '../controllers/moduleController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerModule);
router.delete('/:id', auth, deleteModule);
router.put('/edit/:id', auth, updateModule);
router.put('/cancel/:id', auth, cancelarModule);
router.get('/', auth, getAllModules);

export default router;
