import express from 'express';
const router = express.Router();
import { getAllModalidades } from '../controllers/modalidadesController.js';
import auth from '../middleware/auth.js';

router.get('/', auth, getAllModalidades);

export default router;
