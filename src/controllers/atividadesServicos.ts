import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();


export const getAllAtividadesServicos = async (req: Request, res: Response): Promise<void> => {
  try {
    const atividades = await prisma.db_atividades_servicos.findMany({
      include: {
        db_estabelecimentos_atividades: {
          include: {
            db_estabelecimentos: true
          }
        }
      }
    });

    res.status(200).json({
      msg: 'Atividades de serviços obtidas com sucesso.',
      atividades
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};

export const registerAtividadesServicos = async (req: Request, res: Response): Promise<void> => {
  const {
    cod_tributacao,
    cnae,
    descricao,
    iss,
    cofins,
    pis,
    csll,
    ir,
    inss,
    desconta_imp_tot,
    desconta_ded_tot,
    servico_const_civil,
    situacao,
    estabelecimentos // array de objetos { cod_estabelecimento: number }
  } = req.body;

  try {
    // Validação dos campos obrigatórios
    const camposObrigatorios = [
      { nome: 'descricao', valor: descricao },
      { nome: 'situacao', valor: situacao },
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

    // Criação da atividade de serviço com vínculos aos estabelecimentos
    const novaAtividade = await prisma.db_atividades_servicos.create({
      data: {
        cod_tributacao,
        cnae,
        descricao,
        iss,
        cofins,
        pis,
        csll,
        ir,
        inss,
        desconta_imp_tot,
        desconta_ded_tot,
        servico_const_civil,
        situacao: Situacao.Ativo,
        db_estabelecimentos_atividades: {
          create: estabelecimentos.map((estab: any) => ({
            cod_estabel: estab.cod_estabelecimento
          }))
        }
      }
    });

    res.status(201).json({
      msg: 'Atividade de serviço cadastrada com sucesso.',
      atividade: novaAtividade
    });

  } catch (err: any) {
    console.error('Erro ao registrar atividade de serviço:', err);
    res.status(500).json({
      msg: 'Erro no servidor ao tentar salvar a atividade de serviço.',
      error: err?.message || 'Erro desconhecido'
    });
  }
};

export const updateAtividadesServicos = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    cod_tributacao,
    cnae,
    descricao,
    iss,
    cofins,
    pis,
    csll,
    ir,
    inss,
    desconta_imp_tot,
    desconta_ded_tot,
    servico_const_civil,
    situacao,
    estabelecimentos
  } = req.body;

  try {
    const atividade = await prisma.db_atividades_servicos.findUnique({
      where: { cod_atividade_servico: parseInt(id) }
    });

    if (!atividade) {
      res.status(404).json({ msg: 'Atividade de serviço não encontrada.' });
      return;
    }

    const atividadeAtualizada = await prisma.db_atividades_servicos.update({
      where: { cod_atividade_servico: parseInt(id) },
      data: {
        cod_tributacao: cod_tributacao ?? atividade.cod_tributacao,
        cnae: cnae ?? atividade.cnae,
        descricao: descricao ?? atividade.descricao,
        iss: iss ?? atividade.iss,
        cofins: cofins ?? atividade.cofins,
        pis: pis ?? atividade.pis,
        csll: csll ?? atividade.csll,
        ir: ir ?? atividade.ir,
        inss: inss ?? atividade.inss,
        desconta_imp_tot: desconta_imp_tot ? desconta_imp_tot : atividade.desconta_imp_tot,
        desconta_ded_tot: desconta_ded_tot ? desconta_ded_tot : atividade.desconta_ded_tot,
        servico_const_civil: servico_const_civil ? servico_const_civil : atividade.servico_const_civil,
        situacao: Situacao.Ativo
      }
    });

    if (Array.isArray(estabelecimentos) && estabelecimentos.length > 0) {
      await prisma.db_estabelecimentos_atividades.deleteMany({
        where: { cod_atividade_servico: parseInt(id) }
      });

      const estabelecimentosValidos = estabelecimentos
        .map((estab: any) => ({
          cod_estabel: Number(estab.cod_estabelecimento),
          cod_atividade_servico: parseInt(id)
        }))
        .filter(estab => !isNaN(estab.cod_estabel));

      if (estabelecimentosValidos.length > 0) {
        await prisma.db_estabelecimentos_atividades.createMany({
          data: estabelecimentosValidos
        });
      }
    }

    res.status(200).json({
      msg: 'Atividade de serviço atualizada com sucesso.',
      atividade: atividadeAtualizada
    });

  } catch (err: any) {
    console.error('Erro ao atualizar atividade de serviço:', err.message);
    res.status(500).json({ msg: 'Erro no servidor', error: err.message });
  }
};


export const cancelAtividadeServico = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const natureza = await prisma.db_atividades_servicos.findUnique({
      where: { cod_atividade_servico: parseInt(id) }
    });

    if (!natureza) {
      res.status(404).json({ msg: 'Atividade de serviço não encontrada.' });
      return;
    }

    await prisma.db_atividades_servicos.update({
      where: { cod_atividade_servico: parseInt(id) },
      data: { situacao: Situacao.Inativo }
    });

    res.status(200).json({ msg: 'Atividade de serviço cancelada com sucesso.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erro ao cancelar a natureza.', error: err.message });
  }
};
