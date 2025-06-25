import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllPlanoContas = async (req: Request, res: Response): Promise<void> => {
    try {
        const planoContas = await prisma.db_plano_contas.findMany();

        res.status(200).json({
            msg: 'Plano de contas obtidos com sucesso.',
            planoContas: planoContas
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updatePlanoContas = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
        descricao,
    } = req.body;

    const codPlanoConta = parseInt(id);
    if (isNaN(codPlanoConta)) {
        res.status(400).json({ msg: 'ID inválido.' });
        return;
    }

    try {
        const planoContasToUpdate = await prisma.db_plano_contas.findUnique({
            where: { cod_plano_conta: codPlanoConta }
        });

        if (!planoContasToUpdate) {
            res.status(404).json({ msg: 'Plano de contas não encontrado.' });
            return;
        }

        const updatedPlanoContas = await prisma.db_plano_contas.update({
            where: { cod_plano_conta: codPlanoConta },
            data: {
                descricao: descricao ?? planoContasToUpdate.descricao,
                classificacao: planoContasToUpdate.classificacao,
                cod_grupo_dre: planoContasToUpdate.cod_grupo_dre,
                cod_plano_conta_mae: planoContasToUpdate.cod_plano_conta_mae,
                situacao: Situacao.Ativo,
                dt_cadastro: planoContasToUpdate.dt_cadastro,
            }
        });

        res.status(200).json({
            msg: 'Plano de contas atualizado com sucesso.',
            planoContas: updatedPlanoContas
        });
    } catch (err: any) {
        console.error('Erro ao atualizar plano de contas:', err);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const deletePlanoContas = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const planoContas = await prisma.db_plano_contas.findUnique({
            where: { cod_plano_conta: parseInt(id) }
        });

        if (!planoContas) {
            res.status(404).json({ msg: 'Plano de contas não encontrado.' });
            return;
        }

        await prisma.db_plano_contas.delete({
            where: { cod_plano_conta: parseInt(id) }
        });

        res.status(200).json({
            msg: 'Plano de contas deletado com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarPlanoContas = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o centro de custo existente
        const planoContasToCancel = await prisma.db_plano_contas.findUnique({
            where: { cod_plano_conta: parseInt(id) }
        });

        if (!planoContasToCancel) {
            res.status(404).json({ msg: 'Plano de contas não encontrado.' });
            return;
        }

        // Atualizar o centro de custo
        const updatedPlanoContas = await prisma.db_plano_contas.update({
            where: { cod_plano_conta: parseInt(id) },
            data: {
                situacao: Situacao.Inativo
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Plano de contas cancelado com sucesso.',
            planoContas: updatedPlanoContas
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const registerPlanoContas = async (req: Request, res: Response): Promise<void> => {
    const {
        descricao,
        cod_grupo_dre,
        cod_plano_conta_mae,
    } = req.body;

    try {
        const mensagensErro: string[] = [];

        if (!descricao) mensagensErro.push("O campo 'descricao' é obrigatório.");
        if (!cod_plano_conta_mae) mensagensErro.push("O campo 'cod_plano_conta_mae' é obrigatório.");

        if (mensagensErro.length > 0) {
            res.status(400).json({
                msg: mensagensErro.join(" "),
            });
            return;
        }

        const codMae = String(cod_plano_conta_mae); // garante que seja string

        // Buscar classificações filhas diretas de cod_plano_conta_mae
        const classificacoesFilhas = await prisma.db_plano_contas.findMany({
            where: {
                classificacao: {
                    startsWith: `${codMae}.`,
                },
            },
            select: {
                classificacao: true,
            },
        });

        // Filtrar apenas classificações com exatamente um nível a mais
        const filhasDiretas = classificacoesFilhas
            .map(item => item.classificacao)
            .filter(classificacao => classificacao.split('.').length === codMae.split('.').length + 1);

        // Extrair os sufixos numéricos
        const sufixos = filhasDiretas
            .map(clf => parseInt(clf.split('.').pop() || '0'))
            .filter(num => !isNaN(num));

        const proximoNumero = (Math.max(...sufixos, 0)) + 1;
        const classificacao = `${codMae}.${proximoNumero}`; // ex: 1.1.1 ou 2.3

        // Criar novo plano de contas
        const newPlanoContas = await prisma.db_plano_contas.create({
            data: {
                descricao,
                classificacao,
                cod_plano_conta_mae: parseFloat(codMae),
                cod_grupo_dre: cod_grupo_dre ? parseInt(cod_grupo_dre) : null,
                situacao: Situacao.Ativo,
                dt_cadastro: new Date(),
            }
        });

        res.status(201).json({
            msg: 'Plano de contas cadastrado com sucesso.',
            planoContas: newPlanoContas
        });

    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

