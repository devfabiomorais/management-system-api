import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import estabilishmentRoutes from './routes/estabilishment.js';
import itensRoutes from './routes/itens.js';
import itensFamiliaRoutes from './routes/itensFamilia.js';
import unMedidaRoutes from './routes/unMedida.js';
import clientesRoutes from './routes/clients.js';
import transportadorasRoutes from './routes/transportadoras.js';
import orcamentosRoutes from './routes/orcamentos.js';
import servicosRoutes from './routes/servicos.js';
import centrosCustoRoutes from './routes/centrosCusto.js';
import grupoPermissaoRoutes from './routes/grupoPermissao.js';
import moduleRoutes from './routes/module.js';
import formas_pagamentoRoutes from './routes/formas_pagamento.js';
import emailRoutes from './routes/email.js';
import estruturasRoutes from './routes/estruturas.js';
import pedidosVendaRoutes from './routes/pedidosVenda.js';
import planoContasRoutes from './routes/planoContas.js';
import gruposDRERoutes from './routes/gruposDRE.js';
import contasBancariasRoutes from './routes/contasBancarias.js';
import modalidadesRoutes from './routes/modalidades.js';
import contasFinanceiroRoutes from './routes/contasFinanceiro.js';
import fornecedoresRoutes from './routes/fornecedores.js';
import gruposTributacaoRoutes from './routes/gruposTributacao.js'
import naturezaOperacaoRoutes from './routes/naturezaOperacao.js'
import cfopsRoutes from './routes/cfops.js'
import RegraGrupoTributacaoRoutes from './routes/RegraGrupoTributacao.js'
import atividadesServicosRoutes from './routes/atividadesServicos.js'
import nfsProdutosRoutes from './routes/nfsProdutos.js'
import nfsServicosRoutes from './routes/nfsServicos.js'
import path from 'path';
import { fileURLToPath } from 'url';
import depositosRoutes from './routes/depositosRoutes.js'
import localizacoesRoutes from './routes/localizacoesRoutes.js'
import locaisItensRoutes from './routes/locaisItensRoutes.js';
import movimentacoesRoutes from './routes/movimentacoesRoutes.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(express.text({ type: ['application/xml', 'text/plain'] }));

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' })); // para conseguir receber JSON grande com XML no body

app.get('/', function (req, res) {
  return res.status(200).json({ message: 'Testando' })
});


app.use('/api/formasPagamento', formas_pagamentoRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/estabilishment', estabilishmentRoutes);
app.use('/api/itens', itensRoutes);
app.use('/api/familia/itens', itensFamiliaRoutes);
app.use('/api/unMedida', unMedidaRoutes);

app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/clients', clientesRoutes);
app.use('/api/transportadoras', transportadorasRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/estruturas', estruturasRoutes);
app.use('/api/pedidosvenda', pedidosVendaRoutes);

app.use('/api/contasFinanceiro', contasFinanceiroRoutes);
app.use('/api/modalidades', modalidadesRoutes);
app.use('/api/contasBancarias', contasBancariasRoutes);
app.use('/api/gruposDRE', gruposDRERoutes);
app.use('/api/planoContas', planoContasRoutes);
app.use('/api/centrosCusto', centrosCustoRoutes);
app.use('/api/module', moduleRoutes);
app.use('/api/groupPermission', grupoPermissaoRoutes);

app.use('/api/gruposTributacao', gruposTributacaoRoutes);
app.use('/api/naturezaOperacao', naturezaOperacaoRoutes);
app.use('/api/cfops', cfopsRoutes);
app.use('/api/RegraGrupoTributacao', RegraGrupoTributacaoRoutes);
app.use('/api/atividadesServicos', atividadesServicosRoutes);
app.use('/api/nfsProdutos', nfsProdutosRoutes);
app.use('/api/nfsServicos', nfsServicosRoutes);

app.use('/api/depositos', depositosRoutes);
app.use('/api/localizacoes', localizacoesRoutes);
app.use('/api/locaisItens', locaisItensRoutes);
app.use('/api/movimentacoes', movimentacoesRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/email', emailRoutes);
app.use('/api/nfse', nfsServicosRoutes);

const PORT = process.env.PORT || 9009;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
