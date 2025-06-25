import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();


export const getAllUnits = async (req: Request, res: Response): Promise<void> => {
    try {
        const units = await prisma.db_unidades_medida.findMany({
            include: {
                db_itens: true,
            }
        });

        res.status(200).json({
            msg: 'Unidades de medida obtidas com sucesso.',
            units: units
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const updateUnit = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { unit, description } = req.body;

    try {
        const unitToUpdate = await prisma.db_unidades_medida.findUnique({
            where: { cod_un: parseInt(id) }
        });

        if (!unitToUpdate) {
            res.status(404).json({ msg: 'Unidade de medida não encontrada.' });
            return;
        }

        const updatedUnit = await prisma.db_unidades_medida.update({
            where: { cod_un: parseInt(id) },
            data: {
                un: unit || unitToUpdate.un,
                descricao: description || unitToUpdate.descricao,
                situacao: 'Ativo',
            }
        });

        res.status(200).json({
            msg: 'Unidade de medida atualizada com sucesso.',
            unit: updatedUnit
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const deleteUnit = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const unit = await prisma.db_unidades_medida.findUnique({
            where: { cod_un: parseInt(id) }
        });

        if (!unit) {
            res.status(404).json({ msg: 'Unidade de medida não encontrada.' });
            return;
        }

        await prisma.db_unidades_medida.delete({
            where: { cod_un: parseInt(id) }
        });

        res.status(200).json({
            msg: 'Unidade de medida deletada com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarUnit = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar a unidade de medida existente
        const unitToCancel = await prisma.db_unidades_medida.findUnique({
            where: { cod_un: parseInt(id) },
        });

        if (!unitToCancel) {
            res.status(404).json({ msg: 'Unidade de medida não encontrada.' });
            return;
        }

        // Atualizar a unidade de medida para "Inativo"
        const updatedUnit = await prisma.db_unidades_medida.update({
            where: { cod_un: parseInt(id) },
            data: {
                situacao: Situacao.Inativo, // Ou 'Cancelado', dependendo do seu sistema
            },
        });

        res.status(200).json({
            msg: 'Unidade de medida cancelada com sucesso.',
            updatedUnit,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const registerUnit = async (req: Request, res: Response): Promise<void> => {
    const { unit, description } = req.body;

    try {
        if (!unit || !description) {
            res.status(400).json({ msg: 'Todos os campos são obrigatórios.' });
            return;
        }

        const newUnit = await prisma.db_unidades_medida.create({
            data: {
                un: unit,
                descricao: description
            }
        });

        res.status(201).json({
            msg: 'Unidade de medida cadastrada com sucesso.',
            unit: newUnit
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
