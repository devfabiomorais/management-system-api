import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();


export const getAllFamilies = async (req: Request, res: Response): Promise<void> => {
    try {
        const families = await prisma.db_familias.findMany({
            include: {
                db_itens: true,
            }
        });

        res.status(200).json({
            msg: 'Famílias obtidas com sucesso.',
            families: families
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const updateFamily = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, situacao } = req.body;

    try {
        const family = await prisma.db_familias.findUnique({
            where: { cod_familia: parseInt(id) }
        });

        if (!family) {
            res.status(404).json({ msg: 'Família não encontrada.' });
            return;
        }

        const updatedFamily = await prisma.db_familias.update({
            where: { cod_familia: parseInt(id) },
            data: {
                nome: name || family.nome,
                descricao: description || family.descricao,
                situacao: 'Ativo',
            }
        });

        res.status(200).json({
            msg: 'Família atualizada com sucesso.',
            family: updatedFamily
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const deleteFamily = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const family = await prisma.db_familias.findUnique({
            where: { cod_familia: parseInt(id) }
        });

        if (!family) {
            res.status(404).json({ msg: 'Família não encontrada.' });
            return;
        }

        await prisma.db_familias.delete({
            where: { cod_familia: parseInt(id) }
        });

        res.status(200).json({
            msg: 'Família deletada com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarFamily = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar a família existente
        const familyToCancel = await prisma.db_familias.findUnique({
            where: { cod_familia: parseInt(id) },
        });

        if (!familyToCancel) {
            res.status(404).json({ msg: 'Família não encontrada.' });
            return;
        }

        // Atualizar a família para "Inativo"
        const updatedFamily = await prisma.db_familias.update({
            where: { cod_familia: parseInt(id) },
            data: {
                situacao: Situacao.Inativo, // Ou 'Cancelado', conforme a necessidade
            },
        });

        res.status(200).json({
            msg: 'Família cancelada com sucesso.',
            updatedFamily,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};



export const registerFamily = async (req: Request, res: Response): Promise<void> => {
    const { name, description } = req.body;

    try {
        if (!name || !description) {
            res.status(400).json({ msg: 'Todos os campos são obrigatórios.' });
            return;
        }

        const newFamily = await prisma.db_familias.create({
            data: {
                nome: name,
                descricao: description
            }
        });

        res.status(201).json({
            msg: 'Família cadastrada com sucesso.',
            family: newFamily
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
