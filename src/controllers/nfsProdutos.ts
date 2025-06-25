import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';
import { gerarXmlNFe } from '../services/NFe/gerarXmlNFe.js';
import { assinarXml } from '../services/NFe/assinar-xml.js';
import path from 'path';
import fs from 'fs';
import { enviarNFe } from '../services/NFe/emitir-nfe.js';
import { gerarDanfePdf } from '../services/NFe/PDF/gerarDanfePdf.js';
import { consultarNota } from '../services/NFe/consultar-nfe.js';
import { unirXmls } from '../services/NFe/nota-final.js';

const prisma = new PrismaClient();

export class NFeController {
  static async gerarPDF(req: Request, res: Response) {
    try {
      const { xml } = req.body;

      if (!xml) {
        return res.status(400).json({ error: "XML não fornecido." });
      }

      const outputPath = `./tmp/danfe-${Date.now()}.pdf`;

      await gerarDanfePdf(xml, outputPath);

      const pdfBuffer = fs.readFileSync(outputPath);
      fs.unlinkSync(outputPath);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=danfe.pdf");
      res.send(pdfBuffer);
    } catch (error) {
      console.error('"controllers/nfeProdutos/NFeController{gerarPDF}": Erro ao gerar DANFE PDF:', error);
      res.status(500).json({ error: '"controllers/nfeProdutos/NFeController{gerarPDF}": Erro ao gerar o DANFE PDF.' });
    }
  }
}

export async function emitirNfeHandler(req: Request, res: Response) {
  try {
    const { xml } = req.body;
    if (!xml) {
      return res.status(400).json({ error: 'XML da NF-e não foi enviado.' });
    }

    const caminhoChavePem = path.resolve('./src/services/NFe/chave_privada.pem');
    const caminhoCertificadoPem = path.resolve('./src/services/NFe/certificado_publico.pem');
    const caminhoSaida = path.resolve('./src/services/NFe/xmls/xml-assinado/nfe-assinada.xml');

    // 1. Assina a NF-e
    assinarXml(xml, caminhoChavePem, caminhoCertificadoPem, caminhoSaida);
    console.log('📄 XML assinado com sucesso');

    // 2. Envia a NF-e assinada
    const respostaEnvio = await enviarNFe({
      caminhoXmlAssinado: caminhoSaida,
      caminhoCertificado: caminhoCertificadoPem,
      caminhoChave: caminhoChavePem,
      passphrase: '1234',
      ambiente: 'homologacao',
    });

    console.log('📨 Envio da NF-e concluído');

    // 3. Consulta a NF-e para obter o protocolo
    await consultarNota();
    console.log('🔍 Consulta realizada com sucesso');

    // 4. Une XML assinado com o protocolo para gerar o XML final
    await unirXmls();
    console.log('🧾 XML final gerado com sucesso');

    // Caminho do XML final
    const caminhoNotaFinal = path.resolve('./src/services/NFe/xmls/xml-nota.xml');
    const xmlFinal = fs.readFileSync(caminhoNotaFinal, 'utf8');

    return res.status(200).json({
      message: 'NF-e emitida e processada com sucesso!',
      xmlNotaFinal: xmlFinal,
    });
  } catch (error: any) {
    console.error('Erro ao emitir NF-e:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}

export const gerarXmlNFeController = (req: Request, res: Response) => {
  try {
    const dadosNFe = req.body;
    const xml = gerarXmlNFe(dadosNFe); // agora deve retornar string
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);

  } catch (error) {
    console.error('Erro ao gerar XML da NFe:', error);
    res.status(500).json({ erro: 'Erro ao gerar XML da NFe' });
  }
};

export const getAllNfsProdutos = async (req: Request, res: Response): Promise<void> => {
  try {
    const nfsProdutos = await prisma.db_nfs_produtos.findMany({
      include: {
        produtos: {
          include: {
            item: true,
          },
        },
      },
    });

    res.status(200).json({
      msg: 'Notas fiscais de produtos obtidas com sucesso.',
      nfsProdutos,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};


export const registerNfsProduto = async (req: Request, res: Response): Promise<void> => {
  const {
    numero_nf,
    serie,
    cod_natureza_operacao,
    tipo,
    dt_emissao,
    hr_emissao,
    dt_entrada_saida,
    hr_entrada_saida,
    finalidade_emissao,
    forma_emissao,
    destinacao_operacao,
    tipo_atendimento,
    cod_entidade,
    tipo_en,
    cnpj_cpf_ent,
    razao_social_ent,
    tipo_contribuinte_ent,
    insc_estadual_ent,
    insc_municipal_ent,
    cep_ent,
    logradouro_ent,
    numero_ent,
    estado_ent,
    bairro_ent,
    cidade_ent,
    cod_transportadora,
    cnpj_cpf_transp,
    razao_social_transp,
    tipo_contribuinte_transp,
    insc_estadual_transp,
    insc_municipal_transp,
    cep_transp,
    logradouro_transp,
    numero_transp,
    estado_transp,
    bairro_transp,
    cidade_transp,
    estado_uf,
    placa_veiculo,
    reg_nac_trans_carga,
    modalidade,
    total_icms,
    total_pis,
    total_cofins,
    total_ipi,
    total_produtos,
    total_frete,
    total_nf,
    impostos_federais,
    impostos_estaduais,
    impostos_municipais,
    total_impostos,
    informacoes_complementares,
    informacoes_fisco,
    produtos // <- array de produtos relacionado à nota
  } = req.body;

  try {
    const camposObrigatorios = [
      { nome: 'numero_nf', valor: numero_nf },
      { nome: 'serie', valor: serie },
      { nome: 'tipo', valor: tipo },
      { nome: 'dt_emissao', valor: dt_emissao },
      { nome: 'hr_emissao', valor: hr_emissao },
      { nome: 'cod_entidade', valor: cod_entidade },
      { nome: 'total_nf', valor: total_nf }
    ];

    for (const campo of camposObrigatorios) {
      if (campo.valor === undefined || campo.valor === null || campo.valor === '') {
        res.status(400).json({ msg: `O campo obrigatório "${campo.nome}" não foi recebido.` });
        return;
      }
    }


    // Criação da nota fiscal com os produtos
    const novaNota = await prisma.db_nfs_produtos.create({
      data: {
        numero_nf,
        serie: Number(serie),
        cod_natureza_operacao,
        tipo,
        dt_emissao: new Date(dt_emissao).toISOString(),
        hr_emissao: hr_emissao ? new Date(hr_emissao).toISOString() : null,  // Assumindo que hr_emissao já tem a hora completa
        dt_entrada_saida: dt_entrada_saida ? new Date(dt_entrada_saida).toISOString() : null,
        hr_entrada_saida: hr_entrada_saida ? new Date(hr_entrada_saida).toISOString() : null,
        finalidade_emissao,
        forma_emissao,
        destinacao_operacao,
        tipo_atendimento,
        cod_entidade,
        tipo_en,
        cnpj_cpf_ent,
        razao_social_ent,
        tipo_contribuinte_ent,
        insc_estadual_ent,
        insc_municipal_ent,
        cep_ent,
        logradouro_ent,
        numero_ent,
        estado_ent,
        bairro_ent,
        cidade_ent,
        cod_transportadora,
        cnpj_cpf_transp,
        razao_social_transp,
        tipo_contribuinte_transp,
        insc_estadual_transp,
        insc_municipal_transp,
        cep_transp,
        logradouro_transp,
        numero_transp,
        estado_transp,
        bairro_transp,
        cidade_transp,
        estado_uf,
        placa_veiculo,
        reg_nac_trans_carga,
        modalidade,
        total_icms,
        total_pis,
        total_cofins,
        total_ipi,
        total_produtos,
        total_frete,
        total_nf,
        impostos_federais,
        impostos_estaduais,
        impostos_municipais,
        total_impostos,
        informacoes_complementares,
        informacoes_fisco,

        // Associando produtos via relacionamento correto
        produtos: {
          create: produtos.map((produto: any) => ({
            cod_item: produto.cod_item,
            ncm: produto.ncm,
            cfop: produto.cfop,
            quantidade: produto.quantidade,
            valor_unitario: produto.valor_unitario,
            valor_total: produto.valor_total
          }))
        }
      },
      include: {
        produtos: true
      }
    });



    res.status(201).json({
      msg: 'Nota fiscal de produto cadastrada com sucesso.',
      nota: novaNota
    });

  } catch (err: any) {
    console.error('Erro ao registrar nota fiscal:', err);
    res.status(500).json({
      msg: 'Erro no servidor ao tentar salvar a nota fiscal.',
      error: err?.message || 'Erro desconhecido'
    });
  }
};

export const updateNfsProduto = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const {
    numero_nf,
    serie,
    cod_natureza_operacao,
    tipo,
    dt_emissao,
    hr_emissao,
    dt_entrada_saida,
    hr_entrada_saida,
    finalidade_emissao,
    forma_emissao,
    destinacao_operacao,
    tipo_atendimento,
    cod_entidade,
    tipo_en,
    cnpj_cpf_ent,
    razao_social_ent,
    tipo_contribuinte_ent,
    insc_estadual_ent,
    insc_municipal_ent,
    cep_ent,
    logradouro_ent,
    numero_ent,
    estado_ent,
    bairro_ent,
    cidade_ent,
    cod_transportadora,
    cnpj_cpf_transp,
    razao_social_transp,
    tipo_contribuinte_transp,
    insc_estadual_transp,
    insc_municipal_transp,
    cep_transp,
    logradouro_transp,
    numero_transp,
    estado_transp,
    bairro_transp,
    cidade_transp,
    estado_uf,
    placa_veiculo,
    reg_nac_trans_carga,
    modalidade,
    total_icms,
    total_pis,
    total_cofins,
    total_ipi,
    total_produtos,
    total_frete,
    total_nf,
    impostos_federais,
    impostos_estaduais,
    impostos_municipais,
    total_impostos,
    informacoes_complementares,
    informacoes_fisco,
    produtos
  } = req.body;

  try {
    const nota = await prisma.db_nfs_produtos.findUnique({
      where: { cod_nf_produto: parseInt(id) },
      include: { produtos: true }
    });

    if (!nota) {
      res.status(404).json({ msg: 'Nota fiscal de produto não encontrada.' });
      return;
    }

    // Atualiza a nota
    const notaAtualizada = await prisma.db_nfs_produtos.update({
      where: { cod_nf_produto: parseInt(id) },
      data: {
        numero_nf,
        serie: serie ? Number(serie) : nota.serie,
        cod_natureza_operacao,
        tipo,
        dt_emissao: dt_emissao ? new Date(dt_emissao).toISOString() : nota.dt_emissao,
        hr_emissao: hr_emissao ? new Date(hr_emissao).toISOString() : nota.hr_emissao,
        dt_entrada_saida: dt_entrada_saida ? new Date(dt_entrada_saida).toISOString() : nota.dt_entrada_saida,
        hr_entrada_saida: hr_entrada_saida ? new Date(hr_entrada_saida).toISOString() : nota.hr_entrada_saida,
        finalidade_emissao,
        forma_emissao,
        destinacao_operacao,
        tipo_atendimento,
        cod_entidade,
        tipo_en,
        cnpj_cpf_ent,
        razao_social_ent,
        tipo_contribuinte_ent,
        insc_estadual_ent,
        insc_municipal_ent,
        cep_ent,
        logradouro_ent,
        numero_ent: Number(numero_ent),
        estado_ent,
        bairro_ent,
        cidade_ent,
        cod_transportadora,
        cnpj_cpf_transp,
        razao_social_transp,
        tipo_contribuinte_transp,
        insc_estadual_transp,
        insc_municipal_transp,
        cep_transp,
        logradouro_transp,
        numero_transp: Number(numero_transp),
        estado_transp,
        bairro_transp,
        cidade_transp,
        estado_uf,
        placa_veiculo,
        reg_nac_trans_carga,
        modalidade,
        total_icms,
        total_pis,
        total_cofins,
        total_ipi,
        total_produtos,
        total_frete,
        total_nf,
        impostos_federais,
        impostos_estaduais,
        impostos_municipais,
        total_impostos,
        informacoes_complementares,
        informacoes_fisco
      }
    });

    // Deleta os produtos existentes vinculados à nota
    await prisma.db_produtos_nf.deleteMany({
      where: { cod_nf_produto: parseInt(id) }
    });

    // Recria os produtos vinculados à nota
    if (Array.isArray(produtos) && produtos.length > 0) {
      await prisma.db_produtos_nf.createMany({
        data: produtos.map((produto: any) => ({
          cod_nf_produto: parseInt(id),
          cod_item: produto.cod_item,
          ncm: produto.ncm,
          cfop: produto.cfop,
          quantidade: produto.quantidade,
          valor_unitario: produto.valor_unitario,
          valor_total: produto.valor_total
        }))
      });
    }

    res.status(200).json({
      msg: 'Nota fiscal de produto atualizada com sucesso.',
      nota: notaAtualizada
    });

  } catch (err: any) {
    console.error('Erro ao atualizar nota fiscal:', err);
    res.status(500).json({
      msg: 'Erro no servidor ao tentar atualizar a nota fiscal.',
      error: err?.message || 'Erro desconhecido'
    });
  }
};


export const cancelNfsProduto = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const nota = await prisma.db_nfs_produtos.findUnique({
      where: { cod_nf_produto: parseInt(id) }
    });

    if (!nota) {
      res.status(404).json({ msg: 'Nota fiscal de produto não encontrada.' });
      return;
    }

    await prisma.db_nfs_produtos.update({
      where: { cod_nf_produto: parseInt(id) },
      data: { situacao: Situacao.Inativo }
    });

    res.status(200).json({ msg: 'Nota fiscal de produto cancelada com sucesso.' });
  } catch (err: any) {
    console.error('Erro ao cancelar nota fiscal de produto:', err.message);
    res.status(500).json({ msg: 'Erro ao cancelar a nota fiscal.', error: err.message });
  }
};



