import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os depósitos, incluindo dados relacionados
export const getAllDepositos = async (req: Request, res: Response): Promise<void> => {
  try {
    const depositos = await prisma.db_depositos.findMany({
      include: {
        estabelecimento: true, // Assumindo que deseja incluir dados do estabelecimento
        usuario: true,         // E também do usuário criador
      }
    });

    res.status(200).json({
      msg: 'Depósitos obtidos com sucesso.',
      depositos
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Buscar depósito por cod_deposito
export const getDepositoById = async (req: Request, res: Response): Promise<void> => {
  const { cod_deposito } = req.params;

  try {
    const deposito = await prisma.db_depositos.findUnique({
      where: { cod_deposito },
      include: {
        estabelecimento: true,
        usuario: true,
      }
    });

    if (!deposito) {
      res.status(404).json({ msg: 'Depósito não encontrado.' });
      return;
    }

    res.status(200).json(deposito);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Criar novo depósito
export const registerDeposito = async (req: Request, res: Response): Promise<void> => {
  const {
    cod_deposito,
    descricao,
    cod_estabel,
    tipo,
    dt_hr_criacao,
  } = req.body;

  try {
    if (!cod_deposito) {
      res.status(400).json({ msg: 'O campo cod_deposito é obrigatório.' });
      return;
    }

    const cod_usuario_criado = (req as any).user?.id;

    // Cria novo depósito
    const newDeposito = await prisma.db_depositos.create({
      data: {
        cod_deposito,
        descricao,
        cod_estabel,
        tipo: tipo ?? 'Manutenção',
        cod_usuario: cod_usuario_criado,
        dt_hr_criacao: dt_hr_criacao ? new Date(dt_hr_criacao) : new Date(),
        situacao: Situacao.Ativo
      }
    });

    res.status(201).json({
      msg: 'Depósito cadastrado com sucesso.',
      deposito: newDeposito
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Atualizar depósito por cod_deposito
export const updateDeposito = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    cod_deposito,
    descricao,
    cod_estabel,
    tipo,
    cod_usuario,
    dt_hr_criacao,
  } = req.body;

  try {
    // Verifica se depósito existe
    const existingDeposito = await prisma.db_depositos.findUnique({
      where: { id: Number(id) }
    });

    if (!existingDeposito) {
      res.status(404).json({ msg: 'Depósito não encontrado.' });
      return;
    }

    const updatedDeposito = await prisma.db_depositos.update({
      where: { id: Number(id) },
      data: {
        cod_deposito,
        descricao,
        cod_estabel,
        tipo,
        cod_usuario,
        dt_hr_criacao: dt_hr_criacao ? new Date(dt_hr_criacao) : existingDeposito.dt_hr_criacao,
      }
    });

    res.status(200).json({
      msg: 'Depósito atualizado com sucesso.',
      deposito: updatedDeposito
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Deletar depósito por cod_deposito
export const deleteDeposito = async (req: Request, res: Response): Promise<void> => {
  const { cod_deposito } = req.params;

  try {
    const deposito = await prisma.db_depositos.findUnique({
      where: { cod_deposito }
    });

    if (!deposito) {
      res.status(404).json({ msg: 'Depósito não encontrado.' });
      return;
    }

    await prisma.db_depositos.delete({
      where: { cod_deposito }
    });

    res.status(200).json({ msg: 'Depósito deletado com sucesso.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

export const cancelDeposito = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const deposito = await prisma.db_depositos.findUnique({
      where: { id: parseInt(id) }
    });

    if (!deposito) {
      res.status(404).json({ msg: 'Depósito não encontrado.' });
      return;
    }

    await prisma.db_depositos.update({
      where: { id: parseInt(id) },
      data: { situacao: Situacao.Inativo }
    });

    res.status(200).json({ msg: 'Depósito cancelado com sucesso.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao cancelar o depósito.', error: err.message });
  }
};
