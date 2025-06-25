import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllGruposTributarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const grupos = await prisma.db_grupos_tributacao.findMany({
      include: {
        regras: {
          include: {
            estados: true,
          }
        },
        naturezas_operacao: true,
      }
    });

    res.status(200).json({
      msg: 'Grupos de tributação obtidos com sucesso.',
      grupos: grupos
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

export const registerGrupoTributario = async (req: Request, res: Response): Promise<void> => {
  const {
    nome,
    descricao,
    regras,
  } = req.body;

  const cod_usuario = (req as any).user?.id;

  try {
    if (!nome) {
      res.status(400).json({ msg: 'O campo "nome" é obrigatório.' });
      return;
    }

    if (!cod_usuario) {
      res.status(401).json({ msg: 'Usuário não autenticado.' });
      return;
    }

    const novoGrupo = await prisma.db_grupos_tributacao.create({
      data: {
        nome,
        descricao,
        dt_cadastro: new Date(),
        usuario_cadastro: cod_usuario,
        situacao: "Ativo",
        regras: regras && Array.isArray(regras)
          ? {
            create: regras.map((regra: any) => ({
              tipo: regra.tipo,
              aliquota: regra.aliquota,
              cst_csosn: regra.cst_csosn,
              observacoes: regra.observacoes,
              estados: regra.estados && Array.isArray(regra.estados)
                ? {
                  create: regra.estados.map((uf: string) => ({ uf }))
                }
                : undefined
            }))
          }
          : undefined
      },
      include: {
        regras: {
          include: {
            estados: true
          }
        }
      }
    });

    res.status(201).json({
      msg: 'Grupo de tributação cadastrado com sucesso.',
      grupo: novoGrupo
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};


export const updateGrupoTributario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const grupoId = parseInt(id);
  const { nome, descricao, regras } = req.body;

  try {
    const grupoToUpdate = await prisma.db_grupos_tributacao.findUnique({
      where: { cod_grupo_tributacao: grupoId },
      include: {
        regras: {
          include: {
            estados: true,
          },
        },
      },
    });

    if (!grupoToUpdate) {
      res.status(404).json({ msg: 'Grupo de tributação não encontrado.' });
      return;
    }

    const grupoAtualizado = await prisma.$transaction(async (tx) => {
      const grupo = await tx.db_grupos_tributacao.update({
        where: { cod_grupo_tributacao: grupoId },
        data: {
          nome: nome || grupoToUpdate.nome,
          descricao: descricao || grupoToUpdate.descricao,
        },
      });

      if (Array.isArray(regras)) {
        await tx.db_estados_regra_grupo.deleteMany({
          where: {
            regra_grupo: {
              cod_grupo_tributacao: grupoId,
            },
          },
        });

        await tx.db_regras_grupo_tributacao.deleteMany({
          where: { cod_grupo_tributacao: grupoId },
        });

        for (const regra of regras) {
          await tx.db_regras_grupo_tributacao.create({
            data: {
              cod_grupo_tributacao: grupoId,
              tipo: regra.tipo,
              aliquota: regra.aliquota,
              cst_csosn: regra.cst_csosn,
              observacoes: regra.observacoes,
              estados: {
                create: Array.isArray(regra.estados)
                  ? regra.estados.map((estado: { uf: string }) => ({ uf: estado.uf }))
                  : [],
              },
            },
          });
        }
      }

      return grupo;
    });

    res.status(200).json({
      msg: 'Grupo de tributação atualizado com sucesso.',
      grupo: grupoAtualizado,
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

export const cancelarGrupoTributario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Encontrar o grupo de tributação existente
    const grupoTributarioToCancel = await prisma.db_grupos_tributacao.findUnique({
      where: { cod_grupo_tributacao: parseInt(id) }
    });

    if (!grupoTributarioToCancel) {
      res.status(404).json({ msg: 'Grupo de tributação não encontrado.' });
      return;
    }

    // Atualizar o grupo de tributação
    const updatedGrupoTributario = await prisma.db_grupos_tributacao.update({
      where: { cod_grupo_tributacao: parseInt(id) },
      data: {
        situacao: Situacao.Inativo
      }
    });

    // Retorna sucesso
    res.status(200).json({
      msg: 'Grupo de tributação cancelado com sucesso.',
      grupoTributario: updatedGrupoTributario
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};




