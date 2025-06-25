import express from 'express';
const router = express.Router();

import {
  getAllDepositos,
  registerDeposito,
  updateDeposito,
  deleteDeposito,
  cancelDeposito
} from '../controllers/depositosController.js';

import auth from '../middleware/auth.js';

router.post('/register', auth, registerDeposito);
router.put('/edit/:id', auth, updateDeposito);
router.put('/cancel/:id', auth, cancelDeposito);
router.get('/', auth, getAllDepositos);

export default router;
