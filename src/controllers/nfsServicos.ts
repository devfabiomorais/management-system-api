import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';
import { gerarXmlNFSe } from '../services/NFSe/gerarXmlNFSe.js';
import { assinarXml } from '../services/NFSe/assinar-xml.js'
import { main } from '../services/NFSe/envio-soap.js'
import path from 'path';
import fs from 'fs';
import { gerarDanfsPdf } from '../services/NFSe/PDF/gerarDanfsPdf.js';

const prisma = new PrismaClient();

export class NFSeController {
  static async gerarPDF(req: Request, res: Response) {
    try {
      const { xml } = req.body;

      if (!xml) {
        return res.status(400).json({ error: 'XML não fornecido.' });
      }

      // Caminho temporário onde o PDF será salvo
      const outputPath = `./tmp/danfse-${Date.now()}.pdf`;

      await gerarDanfsPdf(xml, outputPath);

      // Lê o arquivo gerado
      const pdfBuffer = fs.readFileSync(outputPath);

      // Exclui o arquivo temporário após enviar
      fs.unlinkSync(outputPath);

      // Define os headers e envia o PDF como resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=danfse.pdf');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('"controllers/nfsServicos/NFSeController{gerarPDF}": Erro ao gerar DANFSe PDF:', error);
      res.status(500).json({ error: '"controllers/nfsServicos/NFSeController{gerarPDF}": Erro ao gerar o DANFSe PDF.' });
    }
  }
}

export async function emitirNfseHandler(req: Request, res: Response) {
  try {
    const { xml } = req.body;  // espera que o front envie { xml: 'conteúdo XML...' }
    if (!xml) {
      return res.status(400).json({ error: 'XML não foi enviado no corpo da requisição.' });
    }

    const caminhoChavePem = path.resolve('./src/services/NFSe/chave_privada.pem');
    const caminhoCertificadoPem = path.resolve('./src/services/NFSe/certificado_publico.pem');
    const caminhoSaida = path.resolve('./src/services/NFSe/xmls/xml-assinado/xml-assinado.xml');

    // Passo 1: Assina o XML
    assinarXml(xml, caminhoChavePem, caminhoCertificadoPem, caminhoSaida);

    // Passo 2: Chama o fluxo completo de envio
    await main();

    // Passo 3: Lê o XML de resposta da saída (opcional, mas útil para devolver)
    const caminhoRespostaSaida = path.resolve('./src/services/NFSe/xmls/xml-saida/resposta-nfd-saida.xml');
    const respostaSaidaXml = fs.readFileSync(caminhoRespostaSaida, 'utf8');

    // Retorna ao front a confirmação e o XML de resposta
    if (respostaSaidaXml.includes('Erro')) {
      return res.status(400).json({
        message: 'Erro ao emitir NFS-e.',
        xmlResposta: respostaSaidaXml,
        caminhoResposta: caminhoRespostaSaida
      });
    }

    return res.status(200).json({
      message: 'NFS-e emitida com sucesso!',
      xmlResposta: respostaSaidaXml,
      caminhoResposta: caminhoRespostaSaida
    });


  } catch (error: any) {
    console.error('Erro ao emitir NFS-e:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}


export const gerarXmlNFSeController = (req: Request, res: Response) => {
  try {
    const dadosNFSe = req.body;
    const xml = gerarXmlNFSe(dadosNFSe);
    res.type('application/xml').send(xml);
  } catch (error) {
    console.error('Erro ao gerar XML:', error);
    res.status(500).json({ erro: 'Erro ao gerar XML da NFSe' });
  }
};


export const getAllNfsServicos = async (req: Request, res: Response): Promise<void> => {
  try {
    const nfsServicos = await prisma.db_nfs_servicos.findMany({
      include: {
        atividadeServico: true
      }
    });


    res.status(200).json({
      msg: 'Notas fiscais de serviços obtidas com sucesso.',
      nfsServicos,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};


export const registerNfsServico = async (req: Request, res: Response): Promise<void> => {
  const {
    numero_rps,
    serie,
    cod_natureza_operacao,
    dt_emissao,
    hr_emissao,
    cod_entidade,
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
    descricao_servico,
    total_icms,
    aliquota_icms,
    total_cofins,
    aliquota_cofins,
    total_pis,
    aliquota_pis,
    total_csll,
    aliquota_csll,
    total_ir,
    aliquota_ir,
    total_inss,
    aliquota_inss,
    observacoes,
    informacoes_adicionais,
    descontar_impostos,
    total_nf,
    valor_servicos,
    valor_deducoes,
    valor_iss,
    aliquota,
    descontos,
    base_calculo,
    iss_retido,
    cod_atividade_servico,
    item_lista_servico,
    email_ent,
    celular_ent,
    telefone_ent,
    venc_fatura,
  } = req.body;

  try {
    const camposObrigatorios = [
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

    const novaNota = await prisma.db_nfs_servicos.create({
      data: {
        numero_rps,
        serie,
        cod_natureza_operacao,
        dt_emissao: new Date(dt_emissao).toISOString(),
        hr_emissao: hr_emissao ? new Date(hr_emissao).toISOString() : null,
        cod_entidade,
        cnpj_cpf_ent,
        email_ent,
        celular_ent,
        telefone_ent,
        venc_fatura,
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
        descricao_servico,
        total_icms,
        aliquota_icms,
        total_cofins,
        aliquota_cofins,
        total_pis,
        aliquota_pis,
        total_csll,
        aliquota_csll,
        total_ir,
        aliquota_ir,
        total_inss,
        aliquota_inss,
        observacoes,
        informacoes_adicionais,
        descontar_impostos,
        total_nf,
        valor_servicos,
        valor_deducoes,
        valor_iss,
        aliquota,
        descontos,
        base_calculo,
        iss_retido,
        cod_atividade_servico,
        item_lista_servico,
      }
    });

    res.status(201).json({
      msg: 'Nota fiscal de serviço cadastrada com sucesso.',
      nota: novaNota
    });

  } catch (err: any) {
    console.error('Erro ao registrar nota fiscal de serviço:', err);
    res.status(500).json({
      msg: 'Erro no servidor ao tentar salvar a nota fiscal de serviço.',
      error: err?.message || 'Erro desconhecido'
    });
  }
};


export const updateNfsServico = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const {
    numero_rps,
    serie,
    cod_natureza_operacao,
    dt_emissao,
    hr_emissao,
    cod_entidade,
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
    descricao_servico,
    total_icms,
    aliquota_icms,
    total_cofins,
    aliquota_cofins,
    total_pis,
    aliquota_pis,
    total_csll,
    aliquota_csll,
    total_ir,
    aliquota_ir,
    total_inss,
    aliquota_inss,
    observacoes,
    informacoes_adicionais,
    descontar_impostos,
    total_nf,
    valor_servicos,
    valor_deducoes,
    valor_iss,
    aliquota,
    descontos,
    base_calculo,
    iss_retido,
    cod_atividade_servico,
    item_lista_servico,
    email_ent,
    celular_ent,
    telefone_ent,
    venc_fatura,
  } = req.body;

  try {
    if (!id) {
      res.status(400).json({ msg: 'ID da nota fiscal não foi fornecido.' });
      return;
    }

    const notaExistente = await prisma.db_nfs_servicos.findUnique({
      where: { cod_nf_servico: Number(id) }
    });

    if (!notaExistente) {
      res.status(404).json({ msg: 'Nota fiscal de serviço não encontrada.' });
      return;
    }

    const notaAtualizada = await prisma.db_nfs_servicos.update({
      where: { cod_nf_servico: Number(id) },
      data: {
        numero_rps,
        serie,
        cod_natureza_operacao,
        dt_emissao: dt_emissao ? new Date(dt_emissao).toISOString() : undefined,
        hr_emissao: hr_emissao ? new Date(hr_emissao).toISOString() : undefined,
        cod_entidade,
        cnpj_cpf_ent,
        email_ent,
        celular_ent,
        telefone_ent,
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
        descricao_servico,
        total_icms,
        aliquota_icms,
        total_cofins,
        aliquota_cofins,
        total_pis,
        aliquota_pis,
        total_csll,
        aliquota_csll,
        total_ir,
        aliquota_ir,
        total_inss,
        aliquota_inss,
        observacoes,
        informacoes_adicionais,
        descontar_impostos,
        total_nf,
        valor_servicos,
        valor_deducoes,
        valor_iss,
        aliquota,
        descontos,
        base_calculo,
        iss_retido,
        cod_atividade_servico,
        item_lista_servico,
        venc_fatura,
      }
    });

    res.status(200).json({
      msg: 'Nota fiscal de serviço atualizada com sucesso.',
      nota: notaAtualizada
    });

  } catch (err: any) {
    console.error('Erro ao atualizar nota fiscal de serviço:', err);
    res.status(500).json({
      msg: 'Erro no servidor ao tentar atualizar a nota fiscal de serviço.',
      error: err?.message || 'Erro desconhecido'
    });
  }
};



export const cancelNfsServico = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const nota = await prisma.db_nfs_servicos.findUnique({
      where: { cod_nf_servico: parseInt(id) }
    });

    if (!nota) {
      res.status(404).json({ msg: 'Nota fiscal de serviço não encontrada.' });
      return;
    }

    await prisma.db_nfs_servicos.update({
      where: { cod_nf_servico: parseInt(id) },
      data: { situacao: Situacao.Inativo }
    });

    res.status(200).json({ msg: 'Nota fiscal de serviço cancelada com sucesso.' });
  } catch (err: any) {
    console.error('Erro ao cancelar nota fiscal de serviço:', err.message);
    res.status(500).json({ msg: 'Erro ao cancelar a nota fiscal.', error: err.message });
  }
};




