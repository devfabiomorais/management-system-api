import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllEstruturas = async (req: Request, res: Response): Promise<void> => {
    try {
        const estruturas = await prisma.db_estrutura_orcamento.findMany({
            include: {
                db_produtos_estrutura_orcamento: {
                    include: {
                        db_itens: true
                    }
                },
                db_servicos_estrutura_orcamento: {
                    include: {
                        db_servicos: true
                    }
                }
            }
        });

        res.status(200).json({
            msg: 'Estruturas obtidas com sucesso.',
            estruturas: estruturas
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updateEstrutura = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
        nome,
        descricao,
        situacao,
        produtos,
        servicos
    } = req.body;

    try {
        // Verifica se a estrutura existe
        const existingEstrutura = await prisma.db_estrutura_orcamento.findUnique({
            where: { cod_estrutura_orcamento: Number(id) },
        });

        if (!existingEstrutura) {
            res.status(404).json({ msg: 'Estrutura não encontrada.' });
            return;
        }

        // Atualiza os dados principais da estrutura
        await prisma.db_estrutura_orcamento.update({
            where: { cod_estrutura_orcamento: Number(id) },
            data: {
                nome,
                descricao,
                situacao
            },
        });

        // Remove os registros antigos das tabelas relacionadas
        await prisma.db_produtos_estrutura_orcamento.deleteMany({
            where: { cod_estrutura_orcamento: Number(id) },
        });
        await prisma.db_servicos_estrutura_orcamento.deleteMany({
            where: { cod_estrutura_orcamento: Number(id) },
        });

        // Insere os novos registros nas tabelas relacionadas
        if (produtos && produtos.length > 0) {
            await prisma.db_produtos_estrutura_orcamento.createMany({
                data: produtos.map(({ cod_produto, quantidade, valor_unitario, valor_desconto, valor_total, tipo_desconto }: any) => ({
                    cod_produto,
                    quantidade,
                    valor_unitario,
                    valor_desconto,
                    valor_total,
                    tipo_desconto,
                    cod_estrutura_orcamento: Number(id),
                })),
            });
        }

        if (servicos && servicos.length > 0) {
            await prisma.db_servicos_estrutura_orcamento.createMany({
                data: servicos.map(({ cod_servico, quantidade, valor_unitario, valor_desconto, valor_total, tipo_desconto }: any) => ({
                    cod_servico,
                    quantidade,
                    valor_unitario,
                    valor_desconto,
                    valor_total,
                    tipo_desconto,
                    cod_estrutura_orcamento: Number(id),
                })),
            });
        }

        res.status(200).json({ msg: 'Estrutura atualizada com sucesso.' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const registerEstrutura = async (req: Request, res: Response): Promise<void> => {
    const {
        nome,
        descricao,
        db_produtos_estrutura_orcamento,
        db_servicos_estrutura_orcamento,
    } = req.body;

    const cod_usuario_criado = (req as any).user?.id;

    try {
        const missingFields: string[] = [];

        if (!nome) missingFields.push('nome');
        if (!descricao) missingFields.push('descricao');

        if (missingFields.length > 0) {
            res.status(400).json({ msg: `Está faltando o(s) campo(s): ${missingFields.join(', ')}` });
            return;
        }

        // Cria um novo estrutura no banco de dados
        const newEstrutura = await prisma.db_estrutura_orcamento.create({
            data: {
                nome,
                descricao,
                dt_hr_criacao: new Date(), // Define a data de cadastro como a data atual
                cod_usuario_criado,
                situacao: 'Ativo',

                db_produtos_estrutura_orcamento: {
                    create: db_produtos_estrutura_orcamento.map(({ cod_produto, quantidade, valor_unitario, valor_desconto, valor_total, tipo_desconto }: any) => ({
                        cod_produto,
                        quantidade,
                        valor_unitario,
                        valor_desconto,
                        valor_total,
                        tipo_desconto,
                    }))
                },

                db_servicos_estrutura_orcamento: {
                    create: db_servicos_estrutura_orcamento.map(({ cod_servico, quantidade, valor_unitario, valor_desconto, valor_total, tipo_desconto }: any) => ({
                        cod_servico,
                        quantidade,
                        valor_unitario,
                        valor_desconto,
                        valor_total,
                        tipo_desconto,
                    }))
                }
            },
            include: {
                db_produtos_estrutura_orcamento: true,
                db_servicos_estrutura_orcamento: true,
            }
        });


        // Retorna uma resposta de sucesso
        res.status(201).json({
            msg: 'Estrutura de orçamento cadastrada com sucesso.',
            estrutura: newEstrutura
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarEstrutura = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o Estrutura existente
        const EstruturaToCancel = await prisma.db_estrutura_orcamento.findUnique({
            where: { cod_estrutura_orcamento: parseInt(id) }
        });

        if (!EstruturaToCancel) {
            res.status(404).json({ msg: 'Estrutura não encontrada.' });
            return;
        }

        // Atualizar a Estrutura para "Inativo"
        const updatedEstrutura = await prisma.db_estrutura_orcamento.update({
            where: { cod_estrutura_orcamento: parseInt(id) },
            data: {
                situacao: Situacao.Inativo
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Estrutura cancelada com sucesso.',
            Estrutura: updatedEstrutura
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};