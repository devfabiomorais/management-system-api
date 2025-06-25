import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllFormasPgto = async (req: Request, res: Response): Promise<void> => {
    try {
        const formas_pagamento = await prisma.db_formas_pagamento.findMany({
            include: {
                conta_bancaria: true,
                modalidade: true,
            },
        });

        res.status(200).json({
            msg: 'Formas de pagamento obtidas com sucesso.',
            formas_pagamento,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updateFormaPgto = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
        nome,
        descricao,
        situacao,
        cod_conta_bancaria,
        cod_modalidade,
        max_parcelas,
        intervalo_parcelas
    } = req.body;

    try {
        const formaPagamento = await prisma.db_formas_pagamento.findUnique({
            where: { cod_forma_pagamento: parseInt(id) }
        });

        if (!formaPagamento) {
            res.status(404).json({ msg: 'Forma de pagamento não encontrada.' });
            return;
        }

        const updatedFormaPgto = await prisma.db_formas_pagamento.update({
            where: { cod_forma_pagamento: parseInt(id) },
            data: {
                nome: nome ?? formaPagamento.nome,
                descricao: descricao ?? formaPagamento.descricao,
                situacao: situacao ?? formaPagamento.situacao,
                cod_conta_bancaria: cod_conta_bancaria ?? formaPagamento.cod_conta_bancaria,
                cod_modalidade: cod_modalidade ?? formaPagamento.cod_modalidade,
                max_parcelas: max_parcelas ?? formaPagamento.max_parcelas,
                intervalo_parcelas: intervalo_parcelas ?? formaPagamento.intervalo_parcelas,
                dt_cadastro: formaPagamento.dt_cadastro,
            }
        });

        res.status(200).json({
            msg: 'Forma de pagamento atualizada com sucesso.',
            forma_pagamento: updatedFormaPgto
        });
    } catch (err: any) {
        console.error("Erro ao atualizar forma de pagamento:", err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarFormaPagamento = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const formaPagamento = await prisma.db_formas_pagamento.findUnique({
            where: { cod_forma_pagamento: parseInt(id) }
        });

        if (!formaPagamento) {
            res.status(404).json({ msg: 'Forma de pagamento não encontrada.' });
            return;
        }

        const updatedFormaPgto = await prisma.db_formas_pagamento.update({
            where: { cod_forma_pagamento: parseInt(id) },
            data: {
                situacao: 'Inativo'
            }
        });

        res.status(200).json({
            msg: 'Forma de pagamento cancelada com sucesso.',
            forma_pagamento: updatedFormaPgto
        });
    } catch (err: any) {
        console.error("Erro ao cancelar forma de pagamento:", err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const deleteFormaPgto = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const forma_pagamento = await prisma.db_formas_pagamento.findUnique({
            where: { cod_forma_pagamento: parseInt(id) }
        });

        if (!forma_pagamento) {
            res.status(404).json({ msg: 'FormaPgto não encontrado.' });
            return;
        }

        await prisma.db_formas_pagamento.delete({
            where: { cod_forma_pagamento: parseInt(id) }
        });

        res.status(200).json({
            msg: 'FormaPgto deletado com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const registerFormaPgto = async (req: Request, res: Response): Promise<void> => {
    const {
        nome,
        descricao,
        cod_conta_bancaria,
        cod_modalidade,
        max_parcelas,
        intervalo_parcelas
    } = req.body;

    try {
        const missingFields: string[] = [];

        if (!nome) missingFields.push('nome');
        if (!descricao) missingFields.push('descricao');
        if (!cod_conta_bancaria) missingFields.push('cod_conta_bancaria');
        if (!cod_modalidade) missingFields.push('cod_modalidade');
        if (!max_parcelas) missingFields.push('max_parcelas');
        if (!intervalo_parcelas) missingFields.push('intervalo_parcelas');

        if (missingFields.length > 0) {
            res.status(400).json({
                msg: 'Campos obrigatórios ausentes.',
                campos_ausentes: missingFields
            });
            return;
        }

        const newFormaPgto = await prisma.db_formas_pagamento.create({
            data: {
                nome,
                descricao,
                situacao: 'Ativo',
                cod_conta_bancaria,
                cod_modalidade,
                max_parcelas,
                intervalo_parcelas,
                dt_cadastro: new Date(),
            }
        });

        res.status(201).json({
            msg: 'Forma de pagamento cadastrada com sucesso.',
            forma_pagamento: newFormaPgto
        });
    } catch (err: any) {
        console.error("Erro ao cadastrar forma de pagamento:", err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};



