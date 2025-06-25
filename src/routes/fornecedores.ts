import express from 'express';
const router = express.Router();
import { getAllFornecedores, deleteFornecedor, updateFornecedor, registerFornecedor, cancelarFornecedor } from '../controllers/fornecedoresController.js';
import auth from '../middleware/auth.js';

router.post('/register', auth, registerFornecedor);
router.delete('/:id', auth, deleteFornecedor);
router.put('/cancel/:id', auth, cancelarFornecedor);
router.put('/edit/:id', auth, updateFornecedor);
router.get('/', auth, getAllFornecedores);

export default router;
