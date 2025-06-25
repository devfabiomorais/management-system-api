import express from 'express';
const router = express.Router();

import {
  getAllNfsProdutos,
  registerNfsProduto,
  updateNfsProduto,
  cancelNfsProduto,
  // gerarXmlNFeController,
  // emitirNfeHandler,
  // NFeController
} from '../controllers/nfsProdutos.js';

import auth from '../middleware/auth.js';

router.get('/', auth, getAllNfsProdutos);
router.post('/register', auth, registerNfsProduto);
router.put('/edit/:id', auth, updateNfsProduto);
router.put('/cancel/:id', auth, cancelNfsProduto);

// router.post('/gerar-xml', auth, gerarXmlNFeController);
// router.post('/emitir-nfe', auth, emitirNfeHandler);
// router.post('/gerar-pdf', auth, NFeController.gerarPDF);

export default router;
