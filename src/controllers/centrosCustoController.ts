import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCentrosCusto = async (req: Request, res: Response): Promise<void> => {
    try {
        const centrosCusto = await prisma.db_centros_custo.findMany();

        res.status(200).json({
            msg: 'Centros de custo obtidos com sucesso.',
            centrosCusto: centrosCusto
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updateCentrosCusto = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
        nome,
        descricao,
    } = req.body;

    try {
        const centrosCustoToUpdate = await prisma.db_centros_custo.findUnique({
            where: { cod_centro_custo: parseInt(id) }
        });

        if (!centrosCustoToUpdate) {
            res.status(404).json({ msg: 'Centro de custo não encontrado.' });
            return;
        }

        const updatedCentroCusto = await prisma.db_centros_custo.update({
            where: { cod_centro_custo: parseInt(id) },
            data: {
                cod_centro_custo: centrosCustoToUpdate.cod_centro_custo,
                nome: nome ?? centrosCustoToUpdate.nome,
                descricao: descricao ?? centrosCustoToUpdate.descricao,
                situacao: 'Ativo',
            }
        });

        res.status(200).json({
            msg: 'Centro de custo atualizado com sucesso.',
            centrosCusto: updatedCentroCusto
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const deleteCentrosCusto = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const centrosCusto = await prisma.db_centros_custo.findUnique({
            where: { cod_centro_custo: parseInt(id) }
        });

        if (!centrosCusto) {
            res.status(404).json({ msg: 'Centro de custo não encontrado.' });
            return;
        }

        await prisma.db_centros_custo.delete({
            where: { cod_centro_custo: parseInt(id) }
        });

        res.status(200).json({
            msg: 'Centro de custo deletado com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarCentrosCusto = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o centro de custo existente
        const centroCustoToCancel = await prisma.db_centros_custo.findUnique({
            where: { cod_centro_custo: parseInt(id) }
        });

        if (!centroCustoToCancel) {
            res.status(404).json({ msg: 'Centro de custo não encontrado.' });
            return;
        }

        // Atualizar o centro de custo
        const updatedCentroCusto = await prisma.db_centros_custo.update({
            where: { cod_centro_custo: parseInt(id) },
            data: {
                situacao: Situacao.Inativo
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Centro de custo cancelado com sucesso.',
            centroCusto: updatedCentroCusto
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const registerCentrosCusto = async (req: Request, res: Response): Promise<void> => {
    const {
        nome,
        descricao,
    } = req.body;

    try {
        // Verifica se os campos obrigatórios estão presentes
        if (!nome || !descricao) {
            res.status(400).json({ msg: 'Os campos nome e descrição são obrigatórios.' });
            return;
        }

        // Cria um novo serviço no banco de dados
        const newCentroCusto = await prisma.db_centros_custo.create({
            data: {
                nome,
                descricao,
            }
        });

        // Retorna uma resposta de sucesso
        res.status(201).json({
            msg: 'Centro de custo cadastrado com sucesso.',
            centrosCusto: newCentroCusto
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
