import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os LocaisItens
export const getAllLocaisItens = async (req: Request, res: Response): Promise<void> => {
  try {
    const locaisItens = await prisma.db_locais_itens.findMany({
      include: {
        db_itens: true,
        db_unidades_medida: true,
        db_localizacoes: true,
        db_usuarios: true,
      },
    });

    res.status(200).json({
      msg: 'LocaisItens obtidos com sucesso.',
      locaisItens,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Buscar LocalItem por ID
export const getLocalItemById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const localItem = await prisma.db_locais_itens.findUnique({
      where: { cod_local_item: Number(id) },
      include: {
        db_itens: true,
        db_unidades_medida: true,
        db_localizacoes: true,
        db_usuarios: true,
      },
    });

    if (!localItem) {
      res.status(404).json({ msg: 'LocalItem não encontrado.' });
      return;
    }

    res.status(200).json(localItem);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Criar novo LocalItem
export const registerLocalItem = async (req: Request, res: Response): Promise<void> => {
  const { cod_item, cod_un, cod_localizacao } = req.body;

  try {
    const cod_usuario = (req as any).user?.id;

    const novoLocalItem = await prisma.db_locais_itens.create({
      data: {
        cod_item,
        cod_un,
        cod_localizacao,
        cod_usuario,
        dt_hr_criacao: new Date(),
        situacao: Situacao.Ativo,
      },
    });

    res.status(201).json({
      msg: 'LocalItem cadastrado com sucesso.',
      localItem: novoLocalItem,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Atualizar LocalItem
export const updateLocalItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { cod_item, cod_un, cod_localizacao, cod_usuario, dt_hr_criacao } = req.body;

  try {
    const localItemExistente = await prisma.db_locais_itens.findUnique({
      where: { cod_local_item: Number(id) },
    });

    if (!localItemExistente) {
      res.status(404).json({ msg: 'LocalItem não encontrado.' });
      return;
    }

    const localItemAtualizado = await prisma.db_locais_itens.update({
      where: { cod_local_item: Number(id) },
      data: {
        cod_item,
        cod_un,
        cod_localizacao,
        cod_usuario,
        dt_hr_criacao: dt_hr_criacao ? new Date(dt_hr_criacao) : localItemExistente.dt_hr_criacao,
        situacao: Situacao.Ativo, // Presumindo que o LocalItem está ativo após atualização
      },
    });

    res.status(200).json({
      msg: 'LocalItem atualizado com sucesso.',
      localItem: localItemAtualizado,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

// Deletar LocalItem
export const deleteLocalItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const localItem = await prisma.db_locais_itens.findUnique({
      where: { cod_local_item: Number(id) },
    });

    if (!localItem) {
      res.status(404).json({ msg: 'LocalItem não encontrado.' });
      return;
    }

    await prisma.db_locais_itens.delete({
      where: { cod_local_item: Number(id) },
    });

    res.status(200).json({ msg: 'LocalItem deletado com sucesso.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

export const cancelLocalItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const localItem = await prisma.db_locais_itens.findUnique({
      where: { cod_local_item: Number(id) },
    });

    if (!localItem) {
      res.status(404).json({ msg: 'LocalItem não encontrado.' });
      return;
    }

    await prisma.db_locais_itens.update({
      where: { cod_local_item: Number(id) },
      data: {
        situacao: Situacao.Inativo,
      },
    });

    res.status(200).json({ msg: 'LocalItem cancelado com sucesso.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao cancelar o LocalItem.', error: err.message });
  }
};

