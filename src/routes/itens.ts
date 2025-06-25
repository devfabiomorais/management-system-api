import express from 'express';
const router = express.Router();
import { getAllItems, deleteItem, updateItem, registerItem, cancelarItem } from '../controllers/itensController.js';
import auth from '../middleware/auth.js';
import { upload } from '../services/multerConfig.js';


router.post('/register', auth, upload.single("anexo"), registerItem);
router.delete('/:id', auth, deleteItem);
router.put('/edit/:id', auth, updateItem);
router.put('/cancel/:id', auth, cancelarItem);
router.get('/', auth, getAllItems);

export default router;
