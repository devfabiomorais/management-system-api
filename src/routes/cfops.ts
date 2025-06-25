import express from 'express';
const router = express.Router();

import {
  getAllCFOPs,
  registerCFOP,
  updateCFOP
} from '../controllers/cfopController.js';

import auth from '../middleware/auth.js';

router.get('/', auth, getAllCFOPs);
router.post('/register', auth, registerCFOP);
router.put('/edit/:id', auth, updateCFOP);

export default router;
