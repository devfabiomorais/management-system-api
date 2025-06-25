import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllModules = async (req: Request, res: Response): Promise<void> => {
    try {
        const modules = await prisma.db_modulos.findMany();

        res.status(200).json({
            msg: 'Módulos obtidos com sucesso.',
            modules: modules
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updateModule = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { descricao, cod_modulo_pai } = req.body;

    try {
        const moduleToUpdate = await prisma.db_modulos.findUnique({
            where: { cod_modulo: parseInt(id) }
        });

        if (!moduleToUpdate) {
            res.status(404).json({ msg: 'Módulo não encontrado.' });
            return;
        }

        const updatedModule = await prisma.db_modulos.update({
            where: { cod_modulo: parseInt(id) },
            data: {
                descricao: descricao ?? moduleToUpdate.descricao,
                cod_modulo_pai: parseInt(cod_modulo_pai) ?? moduleToUpdate.cod_modulo_pai,
                situacao: 'Ativo',
            }
        });

        res.status(200).json({
            msg: 'Módulo atualizado com sucesso.',
            module: updatedModule
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const deleteModule = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const module = await prisma.db_modulos.findUnique({
            where: { cod_modulo: parseInt(id) }
        });

        if (!module) {
            res.status(404).json({ msg: 'Módulo não encontrado.' });
            return;
        }

        await prisma.db_modulos.delete({
            where: { cod_modulo: parseInt(id) }
        });

        res.status(200).json({
            msg: 'Módulo deletado com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarModule = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o módulo existente
        const moduleToCancel = await prisma.db_modulos.findUnique({
            where: { cod_modulo: parseInt(id) },
        });

        if (!moduleToCancel) {
            res.status(404).json({ msg: 'Módulo não encontrado.' });
            return;
        }

        // Atualizar o módulo para "Inativo" ou status equivalente
        const updatedModule = await prisma.db_modulos.update({
            where: { cod_modulo: parseInt(id) },
            data: {
                situacao: Situacao.Inativo, // Ou outro status de cancelamento
            },
        });

        res.status(200).json({
            msg: 'Módulo cancelado com sucesso.',
            updatedModule,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const registerModule = async (req: Request, res: Response): Promise<void> => {
    const { descricao, cod_modulo_pai } = req.body;

    try {
        if (descricao === "") {
            res.status(400).json({ msg: 'Os campos descricao são obrigatórios.' });
            return;
        }

        const newModule = await prisma.db_modulos.create({
            data: {
                descricao,
                cod_modulo_pai: cod_modulo_pai === "" ? null : parseInt(cod_modulo_pai),
                dt_hr_criacao: new Date(),
            }
        });

        res.status(201).json({
            msg: 'Módulo cadastrado com sucesso.',
            module: newModule
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
