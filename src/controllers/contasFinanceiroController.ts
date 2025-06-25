import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllContasFinanceiro = async (req: Request, res: Response) => {
  try {
    const contas = await prisma.db_contas_financeiro.findMany({
      include: {
        db_centros_custo: true,
        db_conta_bancaria: true,
        db_plano_contas: true,
        db_pagamentos_contas: {
          include: {
            db_formas_pagamento: true
          }
        },
      },
      orderBy: {
        cod_conta: 'desc' // ou 'asc', se preferir ordem crescente
      }
    })

    res.status(200).json({
      msg: 'Contas financeiro obtidas com sucesso.',
      contasFinanceiro: contas
    });
  } catch (error) {
    console.error('Erro ao buscar contas financeiras:', error)
    return res.status(500).json({ error: 'Erro ao buscar contas financeiras' })
  }
}

export const registerContaFinanceiro = async (req: Request, res: Response) => {
  try {
    const {
      tipo_conta,
      cod_fornecedor,
      cod_transportadora,
      cod_cliente,
      descricao,
      dt_vencimento,
      cod_centro_custo,
      cod_conta_bancaria,
      cod_plano_conta,
      pagamento_quitado,
      dt_compensacao,
      nfe,
      nfse,
      valor_bruto,
      valor_final,
      tipo_juros,
      tipo_desconto,
      desconto,
      juros,
      pagamentos
    } = req.body

    const novaConta = await prisma.db_contas_financeiro.create({
      data: {
        tipo_conta,
        cod_fornecedor: cod_fornecedor ? Number(cod_fornecedor) : null,
        cod_transportadora: cod_transportadora ? Number(cod_transportadora) : null,
        cod_cliente: cod_cliente ? Number(cod_cliente) : null,
        descricao,
        dt_vencimento: dt_vencimento ? new Date(dt_vencimento) : null,
        cod_centro_custo,
        cod_conta_bancaria,
        cod_plano_conta,
        pagamento_quitado,
        dt_compensacao: dt_compensacao ? new Date(dt_compensacao) : null,
        nfe,
        nfse: nfse ? nfse : null,
        valor_bruto,
        valor_final,
        tipo_juros,
        tipo_desconto,
        desconto: desconto ? Number(desconto) : null,
        juros: juros ? Number(juros) : null,
        db_pagamentos_contas: {
          create: pagamentos.map(({ valor_parcela, cod_forma_pagamento, parcela, dt_parcela, juros, tipo_juros }: any) => ({
            valor_parcela,
            cod_forma_pagamento,
            parcela,
            dt_parcela: dt_parcela ? new Date(dt_parcela).toISOString() : null,
            juros,
            tipo_juros
          }))
        },
      }
    })

    return res.status(201).json({
      message: 'Conta registrada com sucesso!',
      conta: novaConta
    })
  } catch (error) {
    console.error('Erro ao registrar conta:', error)
    return res.status(500).json({
      error: `Erro ao registrar conta financeira: ${error instanceof Error ? error.message : String(error)}`
    })
  }
}

export const updateContaFinanceiro = async (req: Request, res: Response) => {

  try {
    const {
      cod_conta,
      tipo_conta,
      cod_fornecedor,
      cod_transportadora,
      cod_cliente,
      descricao,
      dt_vencimento,
      cod_centro_custo,
      cod_conta_bancaria,
      cod_plano_conta,
      pagamento_quitado,
      dt_compensacao,
      nfe,
      nfse,
      valor_bruto,
      valor_final,
      tipo_juros,
      tipo_desconto,
      desconto,
      juros,
      pagamentos
    } = req.body

    const contaExistente = await prisma.db_contas_financeiro.findUnique({
      where: { cod_conta: Number(cod_conta) },
    })

    if (!contaExistente) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    // Atualiza a conta
    const contaAtualizada = await prisma.db_contas_financeiro.update({
      where: { cod_conta: Number(cod_conta) },
      data: {
        tipo_conta,
        cod_fornecedor: cod_fornecedor ? Number(cod_fornecedor) : null,
        cod_transportadora: cod_transportadora ? Number(cod_transportadora) : null,
        cod_cliente: cod_cliente ? Number(cod_cliente) : null,
        descricao,
        dt_vencimento: dt_vencimento ? new Date(dt_vencimento) : null,
        cod_centro_custo,
        cod_conta_bancaria,
        cod_plano_conta,
        pagamento_quitado,
        dt_compensacao: dt_compensacao ? new Date(dt_compensacao) : null,
        nfe,
        nfse: nfse ? nfse : null,
        valor_bruto,
        valor_final,
        tipo_juros,
        tipo_desconto,
        desconto: desconto ? Number(desconto) : null,
        juros: juros ? Number(juros) : null,
        db_pagamentos_contas: {
          deleteMany: {},
        },
      }

    })

    // Cria os novos pagamentos, se houver
    if (pagamentos && pagamentos.length > 0) {
      await prisma.db_pagamentos_contas.createMany({
        data: pagamentos.map(
          ({
            valor_parcela,
            cod_forma_pagamento,
            parcela,
            dt_parcela,
            juros,
            tipo_juros,
          }: any) => ({
            cod_conta: Number(cod_conta),
            valor_parcela,
            cod_forma_pagamento,
            parcela,
            dt_parcela: dt_parcela ? new Date(dt_parcela).toISOString() : null,
            juros,
            tipo_juros,
          })
        ),
      })
    }

    return res.status(200).json({
      message: 'Conta e pagamentos atualizados com sucesso!',
      conta: contaAtualizada
    })
  } catch (error) {
    console.error('Erro ao atualizar conta financeira:', error)
    return res.status(500).json({ error: 'Erro ao atualizar conta financeira' })
  }
}

export const cancelContaFinanceiro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const contaExistente = await prisma.db_contas_financeiro.findUnique({
      where: { cod_conta: Number(id) },
    })

    if (!contaExistente) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    await prisma.db_contas_financeiro.update({
      where: { cod_conta: Number(id) },
      data: {
        situacao: 'Inativo',
      },
    })

    return res.status(200).json({
      message: 'Conta cancelada com sucesso!',
    })
  } catch (error) {
    console.error('Erro ao cancelar conta financeira:', error)
    return res.status(500).json({ error: 'Erro ao cancelar conta financeira: ' + error })
  }
}

