import express from 'express';
const router = express.Router();
import { gerarXmlNFSe } from "../services/NFSe/gerarXmlNFSe.js";
import auth from '../middleware/auth.js';

router.post('/gerar-xml', auth, (req, res) => {
  try {
    const dadosNFe = req.body;
    const xml = gerarXmlNFSe(dadosNFe);
    res.type('application/xml').send(xml);
  } catch (error) {
    console.error('Erro ao gerar XML:', error);
    res.status(500).json({ erro: 'Erro ao gerar XML da NFSe' });
  }
});

export default router;
