import { Request, Response } from 'express';
import { PrismaClient, Situacao, TipoNatureza } from '@prisma/client';

const prisma = new PrismaClient();

const removerAcentos = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
};


export const getAllNaturezasOperacao = async (req: Request, res: Response): Promise<void> => {
  try {
    const naturezas = await prisma.db_naturezas_operacao.findMany({
      include: {
        cfop_interno: true,
        cfop_externo: true,
        grupo_tributacao: true,
        db_estabelecimentos_natureza: {
          include: {
            db_estabelecimentos: true // Inclui os dados do estabelecimento relacionado
          }
        }
      }
    });

    res.status(200).json({
      msg: 'Naturezas de operação obtidas com sucesso.',
      naturezas: naturezas
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};


export const registerNaturezaOperacao = async (req: Request, res: Response): Promise<void> => {
  const {
    nome,
    padrao,
    tipo,
    finalidade_emissao,
    tipo_agendamento,
    consumidor_final,
    observacoes,
    cod_grupo_tributacao,
    cod_cfop_interno,
    cod_cfop_externo,
    estabelecimentos // agora um array de objetos
  } = req.body;

  try {
    // Validação de campos obrigatórios
    const camposObrigatorios = [
      { nome: 'nome', valor: nome },
      { nome: 'padrao', valor: padrao },
      { nome: 'tipo', valor: tipo },
      { nome: 'finalidade_emissao', valor: finalidade_emissao },
      { nome: 'tipo_agendamento', valor: tipo_agendamento },
      { nome: 'consumidor_final', valor: consumidor_final },
      { nome: 'observacoes', valor: observacoes },
      { nome: 'cod_grupo_tributacao', valor: cod_grupo_tributacao },
      { nome: 'cod_cfop_interno', valor: cod_cfop_interno },
      { nome: 'cod_cfop_externo', valor: cod_cfop_externo },
      { nome: 'estabelecimentos', valor: estabelecimentos },
    ];

    for (const campo of camposObrigatorios) {
      if (
        campo.valor === undefined ||
        campo.valor === null ||
        campo.valor === '' ||
        (campo.nome === 'estabelecimentos' && (!Array.isArray(estabelecimentos) || estabelecimentos.length === 0))
      ) {
        res.status(400).json({ msg: `O campo obrigatório "${campo.nome}" não foi preenchido.` });
        return;
      }
    }




    // Criação com vínculo direto aos estabelecimentos
    const novaNatureza = await prisma.db_naturezas_operacao.create({
      data: {
        nome,
        padrao,
        tipo: removerAcentos(tipo) as TipoNatureza,
        finalidade_emissao,
        tipo_agendamento,
        consumidor_final,
        observacoes,
        cod_grupo_tributacao: Number(cod_grupo_tributacao),
        cod_cfop_interno,
        cod_cfop_externo,
        db_estabelecimentos_natureza: {
          create: estabelecimentos.map((estab: any) => ({
            cod_estabel: estab.cod_estabelecimento
          }))
        }
      }
    });

    res.status(201).json({
      msg: 'Natureza de operação cadastrada com sucesso.',
      natureza: novaNatureza
    });

  } catch (err: any) {
    console.error('Erro ao registrar natureza de operação:', err);
    res.status(500).json({
      msg: 'Erro no servidor ao tentar salvar a natureza de operação.',
      error: err?.message || 'Erro desconhecido'
    });
  }
};


export const updateNaturezaOperacao = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    nome,
    padrao,
    tipo,
    finalidade_emissao,
    tipo_agendamento,
    consumidor_final,
    observacoes,
    cod_grupo_tributacao,
    cod_cfop_interno,
    cod_cfop_externo,
    estabelecimentos
  } = req.body;

  const removerAcentos = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  };

  try {
    const natureza = await prisma.db_naturezas_operacao.findUnique({
      where: { cod_natureza_operacao: parseInt(id) }
    });

    if (!natureza) {
      res.status(404).json({ msg: 'Natureza de operação não encontrada.' });
      return;
    }

    const naturezaAtualizada = await prisma.db_naturezas_operacao.update({
      where: { cod_natureza_operacao: parseInt(id) },
      data: {
        nome: nome || natureza.nome,
        padrao: padrao || natureza.padrao,
        tipo: removerAcentos(tipo) as TipoNatureza || natureza.tipo,
        finalidade_emissao: finalidade_emissao || natureza.finalidade_emissao,
        tipo_agendamento: tipo_agendamento || natureza.tipo_agendamento,
        consumidor_final: consumidor_final || natureza.consumidor_final,
        observacoes: observacoes || natureza.observacoes,
        cod_grupo_tributacao: cod_grupo_tributacao ?? natureza.cod_grupo_tributacao,
        cod_cfop_interno: cod_cfop_interno || natureza.cod_cfop_interno,
        cod_cfop_externo: cod_cfop_externo || natureza.cod_cfop_externo,
        situacao: Situacao.Ativo
      }
    });

    if (Array.isArray(estabelecimentos) && estabelecimentos.length > 0) {
      await prisma.db_estabelecimentos_natureza.deleteMany({
        where: { cod_natureza_operacao: parseInt(id) }
      });

      const estabelecimentosValidos = estabelecimentos
        .map((estab: any) => ({
          cod_estabel: Number(estab.cod_estabelecimento),
          cod_natureza_operacao: parseInt(id)
        }))
        .filter(estab => !isNaN(estab.cod_estabel)); // Remove itens inválidos

      if (estabelecimentosValidos.length > 0) {
        await prisma.db_estabelecimentos_natureza.createMany({
          data: estabelecimentosValidos
        });
      }
    }

    res.status(200).json({
      msg: 'Natureza de operação atualizada com sucesso.',
      natureza: naturezaAtualizada
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};



export const cancelNatureza = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const natureza = await prisma.db_naturezas_operacao.findUnique({
      where: { cod_natureza_operacao: parseInt(id) }
    });

    if (!natureza) {
      res.status(404).json({ msg: 'Natureza de operação não encontrada.' });
      return;
    }

    await prisma.db_naturezas_operacao.update({
      where: { cod_natureza_operacao: parseInt(id) },
      data: { situacao: Situacao.Inativo }
    });

    res.status(200).json({ msg: 'Natureza de operação cancelada com sucesso.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao cancelar a natureza.', error: err.message });
  }
};
