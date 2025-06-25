import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();


export const getAllEstablishments = async (req: Request, res: Response): Promise<void> => {
    try {
        const establishments = await prisma.db_estabelecimentos.findMany();

        res.status(200).json({
            msg: 'Estabelecimentos obtidos com sucesso.',
            estabelecimentos: establishments
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updateEstablishment = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { nome, logradouro, numero, cep, complemento, estado, cidade, bairro } = req.body;

    try {
        const establishment = await prisma.db_estabelecimentos.findUnique({
            where: { cod_estabelecimento: parseInt(id) }
        });

        if (!establishment) {
            res.status(404).json({ msg: 'Estabelecimento não encontrado.' });
            return;
        }

        const updatedEstablishment = await prisma.db_estabelecimentos.update({
            where: { cod_estabelecimento: parseInt(id) },
            data: {
                nome: nome || establishment.nome,
                logradouro: logradouro || establishment.logradouro,
                numero: parseInt(numero) || establishment.numero,
                cep: cep || establishment.cep,
                complemento: complemento || establishment.complemento,
                estado: estado || establishment.estado,
                cidade: cidade || establishment.cidade,
                bairro: bairro || establishment.bairro,
                situacao: 'Ativo',
            }
        });

        res.status(200).json({
            msg: 'Estabelecimento atualizado com sucesso.',
            estabelecimento: updatedEstablishment
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const deleteEstablishment = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const establishment = await prisma.db_estabelecimentos.findUnique({
            where: { cod_estabelecimento: parseInt(id) }
        });

        if (!establishment) {
            res.status(404).json({ msg: 'Estabelecimento não encontrado.' });
            return;
        }

        await prisma.db_estabelecimentos.delete({
            where: { cod_estabelecimento: parseInt(id) }
        });

        res.status(200).json({ msg: 'Estabelecimento deletado com sucesso.' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarEstablishment = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o estabelecimento existente
        const establishmentToCancel = await prisma.db_estabelecimentos.findUnique({
            where: { cod_estabelecimento: parseInt(id) },
        });

        if (!establishmentToCancel) {
            res.status(404).json({ msg: 'Estabelecimento não encontrado.' });
            return;
        }

        // Atualizar o estabelecimento para "Inativo"
        const updatedEstablishment = await prisma.db_estabelecimentos.update({
            where: { cod_estabelecimento: parseInt(id) },
            data: {
                situacao: Situacao.Inativo, // Ou 'Cancelado', conforme a necessidade
            },
        });

        res.status(200).json({
            msg: 'Estabelecimento cancelado com sucesso.',
            updatedEstablishment,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const registerEstabilishment = async (req: Request, res: Response): Promise<void> => {
    const { code, nome, logradouro, numero, cep, complemento, estado, cidade, bairro } = req.body;

    try {

        const newEstabilishment = await prisma.db_estabelecimentos.create({
            data: {
                nome,
                logradouro,
                numero: parseInt(numero),
                cep,
                complemento: complemento,
                estado,
                cidade,
                bairro,
                dt_hr_criacao: new Date().toISOString()
            }
        });

        res.status(201).json({
            msg: 'Usuário cadastrado com sucesso.',
            newEstabilishment
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
