import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllContasBancarias = async (req: Request, res: Response): Promise<void> => {
    try {
        const contasBancarias = await prisma.db_conta_bancaria.findMany();

        res.status(200).json({
            msg: 'Conta bancária obtidos com sucesso.',
            contasBancarias: contasBancarias
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updateContasBancarias = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
        nome,
        saldo,
        dt_saldo,
        situacao
    } = req.body;

    const codContaBancaria = parseInt(id);
    if (isNaN(codContaBancaria)) {
        res.status(400).json({ msg: 'ID inválido.' });
        return;
    }

    try {
        const contaExistente = await prisma.db_conta_bancaria.findUnique({
            where: { cod_conta_bancaria: codContaBancaria }
        });

        if (!contaExistente) {
            res.status(404).json({ msg: 'Conta bancária não encontrada.' });
            return;
        }

        const contaAtualizada = await prisma.db_conta_bancaria.update({
            where: { cod_conta_bancaria: codContaBancaria },
            data: {
                nome: nome ?? contaExistente.nome,
                saldo: saldo !== undefined ? parseFloat(saldo) : contaExistente.saldo,
                dt_saldo: dt_saldo ? new Date(dt_saldo) : contaExistente.dt_saldo,
                situacao: situacao ?? contaExistente.situacao,
                dt_cadastro: contaExistente.dt_cadastro, // mantém a data original
            }
        });

        res.status(200).json({
            msg: 'Conta bancária atualizada com sucesso.',
            contaBancaria: contaAtualizada
        });
    } catch (err: any) {
        console.error('Erro ao atualizar conta bancária:', err);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarContasBancarias = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o centro de custo existente
        const contasBancariasToCancel = await prisma.db_conta_bancaria.findUnique({
            where: { cod_conta_bancaria: parseInt(id) }
        });

        if (!contasBancariasToCancel) {
            res.status(404).json({ msg: 'Conta bancária não encontrado.' });
            return;
        }

        // Atualizar o centro de custo
        const updatedContasBancarias = await prisma.db_conta_bancaria.update({
            where: { cod_conta_bancaria: parseInt(id) },
            data: {
                situacao: Situacao.Inativo
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Conta bancária cancelado com sucesso.',
            contasBancarias: updatedContasBancarias
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const registerContasBancarias = async (req: Request, res: Response): Promise<void> => {
    const {
        nome,
        saldo,
        dt_saldo,
    } = req.body;

    try {
        const mensagensErro: string[] = [];

        if (!nome) mensagensErro.push("O campo 'nome' é obrigatório.");
        if (saldo === undefined || saldo === null) mensagensErro.push("O campo 'saldo' é obrigatório.");

        if (mensagensErro.length > 0) {
            res.status(400).json({
                msg: mensagensErro.join(" "),
            });
            return;
        }

        const newContaBancaria = await prisma.db_conta_bancaria.create({
            data: {
                nome,
                saldo: parseFloat(saldo),
                dt_saldo: dt_saldo ? new Date(dt_saldo) : null,
                situacao: Situacao.Ativo,
                dt_cadastro: new Date(),
            }
        });

        res.status(201).json({
            msg: 'Conta bancária cadastrada com sucesso.',
            contaBancaria: newContaBancaria
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
