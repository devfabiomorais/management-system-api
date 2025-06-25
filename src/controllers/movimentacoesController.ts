import { Request, Response } from 'express';
import { PrismaClient, Situacao, TipoMovimentacao } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todas as movimentações
export const getAllMovimentacoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const movimentacoes = await prisma.db_movimentacoes.findMany({
      include: {
        db_itens: true,
        db_unidades_medida: true,
        db_locais_itens: true,
        db_usuarios: true,
      },
    });

    res.status(200).json({
      msg: 'Movimentações obtidas com sucesso.',
      movimentacoes,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Buscar movimentação por ID
export const getMovimentacaoById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const movimentacao = await prisma.db_movimentacoes.findUnique({
      where: { cod_movimentacao: Number(id) },
      include: {
        db_itens: true,
        db_unidades_medida: true,
        db_locais_itens: true,
        db_usuarios: true,
      },
    });

    if (!movimentacao) {
      res.status(404).json({ msg: 'Movimentação não encontrada.' });
      return;
    }

    res.status(200).json(movimentacao);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Criar nova movimentação
export const registerMovimentacao = async (req: Request, res: Response): Promise<void> => {
  const { cod_item, cod_un, cod_local_item, lote, quantidade, observacoes, tipo } = req.body;

  try {
    const cod_usuario = (req as any).user?.id;

    const novaMovimentacao = await prisma.db_movimentacoes.create({
      data: {
        cod_item,
        cod_un,
        cod_local_item,
        lote,
        quantidade,
        observacoes,
        tipo,
        cod_usuario,
        dt_hr_criacao: new Date(),
        situacao: Situacao.Ativo,
      },
    });

    res.status(201).json({
      msg: 'Movimentação cadastrada com sucesso.',
      movimentacao: novaMovimentacao,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao cadastrar a movimentação.', error: err.message });
  }
};

// Atualizar movimentação
export const updateMovimentacao = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { cod_item, cod_un, cod_local_item, lote, quantidade, observacoes, tipo, cod_usuario, dt_hr_criacao } = req.body;

  try {
    const movimentacaoExistente = await prisma.db_movimentacoes.findUnique({
      where: { cod_movimentacao: Number(id) },
    });

    if (!movimentacaoExistente) {
      res.status(404).json({ msg: 'Movimentação não encontrada.' });
      return;
    }

    const movimentacaoAtualizada = await prisma.db_movimentacoes.update({
      where: { cod_movimentacao: Number(id) },
      data: {
        cod_item,
        cod_un,
        cod_local_item,
        lote,
        quantidade,
        observacoes,
        tipo: movimentacaoExistente.tipo, // Mantém o tipo original
        cod_usuario: movimentacaoExistente.cod_usuario, // Mantém o usuário original
        dt_hr_criacao: movimentacaoExistente.dt_hr_criacao,
        situacao: Situacao.Ativo,
      },
    });

    res.status(200).json({
      msg: 'Movimentação atualizada com sucesso.',
      movimentacao: movimentacaoAtualizada,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao atualizar a movimentação.', error: err.message });
  }
};

// Deletar movimentação
export const deleteMovimentacao = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const movimentacao = await prisma.db_movimentacoes.findUnique({
      where: { cod_movimentacao: Number(id) },
    });

    if (!movimentacao) {
      res.status(404).json({ msg: 'Movimentação não encontrada.' });
      return;
    }

    await prisma.db_movimentacoes.delete({
      where: { cod_movimentacao: Number(id) },
    });

    res.status(200).json({ msg: 'Movimentação deletada com sucesso.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao deletar a movimentação.', error: err.message });
  }
};

// Cancelar (Inativar) movimentação
export const cancelMovimentacao = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const movimentacao = await prisma.db_movimentacoes.findUnique({
      where: { cod_movimentacao: Number(id) },
    });

    if (!movimentacao) {
      res.status(404).json({ msg: 'Movimentação não encontrada.' });
      return;
    }

    await prisma.db_movimentacoes.update({
      where: { cod_movimentacao: Number(id) },
      data: {
        situacao: Situacao.Inativo,
      },
    });

    res.status(200).json({ msg: 'Movimentação cancelada com sucesso.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao cancelar a movimentação.', error: err.message });
  }
};
