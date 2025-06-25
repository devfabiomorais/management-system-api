import express from 'express';
const router = express.Router();
import { getAllClients, deleteClient, updateClient, registerClient, cancelarClient } from '../controllers/clientesController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerClient);
router.delete('/:id', auth, deleteClient);
router.put('/cancel/:id', auth, cancelarClient);
router.put('/edit/:id', auth, updateClient);
router.get('/', auth, getAllClients);

export default router;
