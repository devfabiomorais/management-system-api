import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllModalidades = async (req: Request, res: Response): Promise<void> => {
    try {
        const modalidades = await prisma.db_modalidade.findMany();

        res.status(200).json({
            msg: 'Modalidades de pagamento obtidas com sucesso.',
            modalidades,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};




