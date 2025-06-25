import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET ALL
export const getAllCFOPs = async (req: Request, res: Response): Promise<void> => {
  try {
    const cfops = await prisma.db_cfops.findMany();
    res.status(200).json({
      msg: 'CFOPs obtidas com sucesso.',
      cfops: cfops,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// REGISTER
export const registerCFOP = async (req: Request, res: Response): Promise<void> => {
  const { cod_cfop, descricao, tipo_operacao, origem_destino, db_cfopcol } = req.body;

  try {
    if (!cod_cfop || !descricao || !tipo_operacao || !origem_destino) {
      res.status(400).json({ msg: 'Campos obrigatórios estão faltando.' });
      return;
    }

    const newCFOP = await prisma.db_cfops.create({
      data: {
        cod_cfop,
        descricao,
        tipo_operacao,
        origem_destino,
        db_cfopcol,
      },
    });

    res.status(201).json({
      msg: 'CFOP cadastrada com sucesso.',
      cfop: newCFOP,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao cadastrar CFOP', error: err.message });
  }
};

// UPDATE
export const updateCFOP = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { descricao, tipo_operacao, origem_destino, db_cfopcol } = req.body;

  try {
    const cfopToUpdate = await prisma.db_cfops.findUnique({
      where: { cod_cfop: id },
    });

    if (!cfopToUpdate) {
      res.status(404).json({ msg: 'CFOP não encontrada.' });
      return;
    }

    const updatedCFOP = await prisma.db_cfops.update({
      where: { cod_cfop: id },
      data: {
        descricao: descricao || cfopToUpdate.descricao,
        tipo_operacao: tipo_operacao || cfopToUpdate.tipo_operacao,
        origem_destino: origem_destino || cfopToUpdate.origem_destino,
        db_cfopcol: db_cfopcol || cfopToUpdate.db_cfopcol,
      },
    });

    res.status(200).json({
      msg: 'CFOP atualizada com sucesso.',
      cfop: updatedCFOP,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao atualizar CFOP', error: err.message });
  }
};
