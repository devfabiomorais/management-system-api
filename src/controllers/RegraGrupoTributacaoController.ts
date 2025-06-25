import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllRegraGrupoTributacao = async (req: Request, res: Response): Promise<void> => {
  try {
    const regras = await prisma.db_regras_grupo_tributacao.findMany({
      include: {
        grupo: true,
        estados: true,
      }
    });

    res.status(200).json({
      msg: 'Regras de grupo de tributação obtidas com sucesso.',
      regras: regras
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

export const registerRegraGrupoTributacao = async (req: Request, res: Response): Promise<void> => {
  const {
    cod_grupo_tributacao,
    tipo,
    aliquota,
    cst_csosn,
    observacoes,
    estados
  } = req.body;

  try {
    const novaRegra = await prisma.db_regras_grupo_tributacao.create({
      data: {
        cod_grupo_tributacao: cod_grupo_tributacao === 0 ? null : cod_grupo_tributacao,
        tipo,
        aliquota,
        cst_csosn,
        observacoes,
        estados: estados && Array.isArray(estados)
          ? {
            create: estados.map((uf: string) => ({ uf }))
          }
          : undefined
      },
      include: {
        estados: true
      }
    });

    res.status(201).json({
      msg: 'Regra de grupo de tributação cadastrada com sucesso.',
      regra: novaRegra
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};
