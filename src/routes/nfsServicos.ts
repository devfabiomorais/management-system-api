import express from 'express';
const router = express.Router();

import {
  getAllNfsServicos,
  registerNfsServico,
  updateNfsServico,
  cancelNfsServico,
  // gerarXmlNFSeController,
  // emitirNfseHandler,
  // NFSeController
} from '../controllers/nfsServicos.js';

import auth from '../middleware/auth.js';

router.get('/', auth, getAllNfsServicos);
router.post('/register', auth, registerNfsServico);
router.put('/edit/:id', auth, updateNfsServico);
router.put('/cancel/:id', auth, cancelNfsServico);

// router.post('/gerar-xml', auth, gerarXmlNFSeController);
// router.post('/emitir-nfse', auth, emitirNfseHandler);
// router.post('/gerar-pdf', auth, NFSeController.gerarPDF);


export default router;
