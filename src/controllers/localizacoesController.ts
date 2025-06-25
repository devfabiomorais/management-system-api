import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todas as localizações
export const getAllLocalizacoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const localizacoes = await prisma.db_localizacoes.findMany({
      include: {
        deposito: true,
        unidade_medida: true,
        usuario: true,
      }
    });

    res.status(200).json({
      msg: 'Localizações obtidas com sucesso.',
      localizacoes
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Buscar localização por cod_localizacao
export const getLocalizacaoById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const localizacao = await prisma.db_localizacoes.findUnique({
      where: { cod_localizacao: Number(id) },
      include: {
        deposito: true,
        unidade_medida: true,
        usuario: true,
      }
    });

    if (!localizacao) {
      res.status(404).json({ msg: 'Localização não encontrada.' });
      return;
    }

    res.status(200).json(localizacao);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Criar nova localização
export const registerLocalizacao = async (req: Request, res: Response): Promise<void> => {
  const {
    cod_deposito,
    capacidade,
    cod_un,
    cod_rua,
    cod_coluna,
    cod_nivel,
    dt_hr_criacao,
  } = req.body;

  try {
    const cod_usuario = (req as any).user?.id;

    const novaLocalizacao = await prisma.db_localizacoes.create({
      data: {
        cod_deposito,
        capacidade,
        cod_un,
        cod_rua,
        cod_coluna,
        cod_nivel,
        cod_usuario,
        dt_hr_criacao: dt_hr_criacao ? new Date(dt_hr_criacao) : new Date(),
        situacao: Situacao.Ativo
      }
    });

    res.status(201).json({
      msg: 'Localização cadastrada com sucesso.',
      localizacao: novaLocalizacao
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Atualizar localização por cod_localizacao
export const updateLocalizacao = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    cod_deposito,
    capacidade,
    cod_un,
    cod_rua,
    cod_coluna,
    cod_nivel,
    cod_usuario,
    dt_hr_criacao,
  } = req.body;

  try {
    const localizacaoExistente = await prisma.db_localizacoes.findUnique({
      where: { cod_localizacao: Number(id) }
    });

    if (!localizacaoExistente) {
      res.status(404).json({ msg: 'Localização não encontrada.' });
      return;
    }

    const localizacaoAtualizada = await prisma.db_localizacoes.update({
      where: { cod_localizacao: Number(id) },
      data: {
        cod_deposito,
        capacidade,
        cod_un,
        cod_rua,
        cod_coluna,
        cod_nivel,
        cod_usuario,
        dt_hr_criacao: dt_hr_criacao ? new Date(dt_hr_criacao) : localizacaoExistente.dt_hr_criacao,
      }
    });

    res.status(200).json({
      msg: 'Localização atualizada com sucesso.',
      localizacao: localizacaoAtualizada
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Deletar localização por cod_localizacao
export const deleteLocalizacao = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const localizacao = await prisma.db_localizacoes.findUnique({
      where: { cod_localizacao: Number(id) }
    });

    if (!localizacao) {
      res.status(404).json({ msg: 'Localização não encontrada.' });
      return;
    }

    await prisma.db_localizacoes.delete({
      where: { cod_localizacao: Number(id) }
    });

    res.status(200).json({ msg: 'Localização deletada com sucesso.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Cancelar (inativar) localização
export const cancelLocalizacao = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const localizacao = await prisma.db_localizacoes.findUnique({
      where: { cod_localizacao: Number(id) }
    });

    if (!localizacao) {
      res.status(404).json({ msg: 'Localização não encontrada.' });
      return;
    }

    await prisma.db_localizacoes.update({
      where: { cod_localizacao: Number(id) },
      data: { situacao: Situacao.Inativo }
    });

    res.status(200).json({ msg: 'Localização cancelada com sucesso.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao cancelar a localização.', error: err.message });
  }
};

