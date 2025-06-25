import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllServicos = async (req: Request, res: Response): Promise<void> => {
    try {
        const servicos = await prisma.db_servicos.findMany();

        res.status(200).json({
            msg: 'Servicos obtidos com sucesso.',
            servicos: servicos
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updateServico = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // ID agora vem da URL
    if (!id || isNaN(Number(id))) {
        res.status(400).json({ msg: "ID inválido." });
        return;
    }

    const {
        nome,
        descricao,
        valor_venda,
        valor_custo,
        comissao,
        dtCadastro,
    } = req.body;

    try {
        const codServico = Number(id);

        const servicoToUpdate = await prisma.db_servicos.findUnique({
            where: { cod_servico: codServico }
        });

        if (!servicoToUpdate) {
            res.status(404).json({ msg: "Serviço não encontrado." });
            return;
        }

        const updatedServico = await prisma.db_servicos.update({
            where: { cod_servico: codServico },
            data: {
                nome: nome ?? servicoToUpdate.nome,
                descricao: descricao ?? servicoToUpdate.descricao,
                valor_venda: valor_venda ?? servicoToUpdate.valor_venda,
                valor_custo: valor_custo ?? servicoToUpdate.valor_custo,
                comissao: comissao ?? servicoToUpdate.comissao,
                dtCadastro: dtCadastro ?? servicoToUpdate.dtCadastro,
                situacao: "Ativo",
            }
        });

        res.status(200).json({
            msg: "Serviço atualizado com sucesso.",
            servico: updatedServico,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: "Erro no servidor", error: err.message });
    }
};



export const deleteServico = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const servico = await prisma.db_servicos.findUnique({
            where: { cod_servico: parseInt(id) }
        });

        if (!servico) {
            res.status(404).json({ msg: 'Servico não encontrado.' });
            return;
        }

        await prisma.db_servicos.delete({
            where: { cod_servico: parseInt(id) }
        });

        res.status(200).json({
            msg: 'Servico deletado com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarServico = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o serviço existente
        const servicoToCancel = await prisma.db_servicos.findUnique({
            where: { cod_servico: parseInt(id) }
        });

        if (!servicoToCancel) {
            res.status(404).json({ msg: 'Serviço não encontrado.' });
            return;
        }

        // Atualizar o serviço para "Inativo"
        const updatedServico = await prisma.db_servicos.update({
            where: { cod_servico: parseInt(id) },
            data: {
                situacao: Situacao.Inativo
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Serviço cancelado com sucesso.',
            servico: updatedServico
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const registerServico = async (req: Request, res: Response): Promise<void> => {
    const {
        nome,
        descricao,
        valor_venda,
        valor_custo,
        comissao,
    } = req.body;

    try {
        // Verifica se os campos obrigatórios estão presentes
        if (!nome || !valor_venda || !valor_custo) {
            res.status(400).json({ msg: 'Os campos nome, valor_venda, e valor_custo são obrigatórios.' });
            return;
        }

        // Cria um novo serviço no banco de dados
        const newServico = await prisma.db_servicos.create({
            data: {
                nome,
                descricao,
                valor_venda,
                valor_custo,
                comissao: comissao !== '' ? comissao : null,
                dtCadastro: new Date(),
            }
        });

        // Retorna uma resposta de sucesso
        res.status(201).json({
            msg: 'Servico cadastrado com sucesso.',
            servico: newServico
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

