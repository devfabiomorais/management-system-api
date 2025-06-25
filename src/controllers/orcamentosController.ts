import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();


export const getCanaisVenda = async (req: Request, res: Response): Promise<void> => {
    try {
        const canaisVenda = ["Presencial", "Internet", "Telemarketing"];

        res.status(200).json({ canaisVenda });
    } catch (error: any) {
        console.error("Erro ao buscar canais de venda:", error.message);
        res.status(500).json({ msg: "Erro no servidor", error: error.message });
    }
};


export const getAllOrcamentos = async (req: Request, res: Response): Promise<void> => {
    try {
        const orcamentos = await prisma.db_orcamentos.findMany({
            include: {
                db_pagamentos_orcamento: true,
                db_produtos_orcamento: {
                    include: {
                        db_itens: true
                    }
                },
                db_servicos_orcamento: {
                    include: {
                        db_servicos: true
                    }
                }
            }
        });

        res.status(200).json({
            msg: 'Orçamentos obtidos com sucesso.',
            orcamentos: orcamentos
        });
    } catch (err: any) {
        if (err instanceof Error) {
            if (err instanceof Error) {
                if (err instanceof Error) {
                    if (err instanceof Error) {
                        console.error(err.message);
                    } else {
                        console.error('Unknown error', err);
                    }
                } else {
                    console.error('Unknown error', err);
                }
            } else {
                console.error('Unknown error', err);
            }
        } else {
            console.error('Unknown error', err);
        }
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const updateOrcamento = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
        cod_responsavel,
        cod_cliente,
        canal_venda,
        data_venda,
        prazo,
        cod_centro_custo,
        frota,
        nf_compra,
        cod_transportadora,
        frete,
        endereco_cliente,
        logradouro,
        cidade,
        bairro,
        estado,
        complemento,
        numero,
        cep,
        observacoes_gerais,
        observacoes_internas,
        desconto_total,
        valor_total,
        situacao,
        parcelas,
        produtos,
        servicos,
        garantia,
        tipo_garantia,
        db_estrutura_orcamento,
    } = req.body;

    try {
        // Verifica se o orçamento existe
        const existingOrcamento = await prisma.db_orcamentos.findUnique({
            where: { cod_orcamento: Number(id) },
        });

        if (!existingOrcamento) {
            res.status(404).json({ msg: 'Orçamento não encontrado.' });
            return;
        }

        // Atualiza apenas os dados principais do orçamento
        await prisma.db_orcamentos.update({
            where: { cod_orcamento: Number(id) },
            data: {
                cod_responsavel,
                cod_cliente,
                canal_venda,
                data_venda: new Date(data_venda).toISOString(),
                prazo: new Date(prazo).toISOString(),
                cod_centro_custo,
                frota,
                nf_compra,
                cod_transportadora,
                frete,
                endereco_cliente: endereco_cliente || null,
                logradouro: logradouro || null,
                cidade: cidade || null,
                bairro: bairro || null,
                estado: estado || null,
                complemento: complemento || null,
                numero: numero ? Number(numero) : null,
                cep: cep || null,
                observacoes_gerais: observacoes_gerais || null,
                observacoes_internas: observacoes_internas || null,
                desconto_total,
                valor_total,
                situacao,
                garantia,
                tipo_garantia,
                db_estrutura_orcamento: db_estrutura_orcamento
                    ? { connect: { cod_estrutura_orcamento: db_estrutura_orcamento } }
                    : { disconnect: true },
            },
        });

        // Remove os registros antigos das tabelas relacionadas
        await prisma.db_pagamentos_orcamento.deleteMany({ where: { cod_orcamento: Number(id) } });
        await prisma.db_produtos_orcamento.deleteMany({ where: { cod_orcamento: Number(id) } });
        await prisma.db_servicos_orcamento.deleteMany({ where: { cod_orcamento: Number(id) } });

        // Insere os novos registros nas tabelas relacionadas
        if (parcelas.length > 0) {
            await prisma.db_pagamentos_orcamento.createMany({
                data: parcelas.map(({ valorParcela, cod_forma_pagamento, parcela, data_parcela, juros, tipo_juros }: any) => ({
                    valorParcela,
                    cod_forma_pagamento,
                    parcela,
                    data_parcela: new Date(data_parcela).toISOString(),
                    juros,
                    tipo_juros,
                    cod_orcamento: Number(id) // Mantém a referência correta
                })),
            });
        }

        if (produtos.length > 0) {
            await prisma.db_produtos_orcamento.createMany({
                data: produtos.map(({ cod_produto, quantidade, valor_unitario, valor_desconto, valor_total, tipo_desconto }: any) => ({
                    cod_produto,
                    quantidade,
                    valor_unitario,
                    valor_desconto,
                    valor_total,
                    tipo_desconto,
                    cod_orcamento: Number(id)
                })),
            });
        }

        if (servicos.length > 0) {
            await prisma.db_servicos_orcamento.createMany({
                data: servicos.map(({ cod_servico, quantidade, valor_unitario, valor_desconto, valor_total, tipo_desconto }: any) => ({
                    cod_servico,
                    quantidade,
                    valor_unitario,
                    valor_desconto,
                    valor_total,
                    tipo_desconto,
                    cod_orcamento: Number(id)
                })),
            });
        }

        res.status(200).json({ msg: 'Orçamento atualizado com sucesso.' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const cancelarOrcamento = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o orçamento existente
        const orcamentoToCancel = await prisma.db_orcamentos.findUnique({
            where: { cod_orcamento: parseInt(id) }
        });

        if (!orcamentoToCancel) {
            res.status(404).json({ msg: 'Orçamento não encontrado.' });
            return;
        }

        // Atualizar o orçamento
        const updatedOrcamento = await prisma.db_orcamentos.update({
            where: { cod_orcamento: parseInt(id) },
            data: {
                situacao: 'Cancelado'
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Orçamento cancelado com sucesso.',
            orcamento: updatedOrcamento
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const pedidoGerado = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o orçamento existente
        const orcamentoToChange = await prisma.db_orcamentos.findUnique({
            where: { cod_orcamento: parseInt(id) }
        });

        if (!orcamentoToChange) {
            res.status(404).json({ msg: 'Orçamento não encontrado.' });
            return;
        }

        // Atualizar o orçamento
        const updatedOrcamento = await prisma.db_orcamentos.update({
            where: { cod_orcamento: parseInt(id) },
            data: {
                situacao: 'Pedido_Gerado'
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Situação do orçamento alterada com sucesso.',
            orcamento: updatedOrcamento
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const deleteOrcamento = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const orcamento = await prisma.db_orcamentos.findUnique({
            where: { cod_orcamento: parseInt(id) }
        });

        if (!orcamento) {
            res.status(404).json({ msg: 'Orçamento não encontrado.' });
            return;
        }

        await prisma.db_orcamentos.delete({
            where: { cod_orcamento: parseInt(id) }
        });

        res.status(200).json({
            msg: 'Orçamento deletado com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const registerOrcamento = async (req: Request, res: Response): Promise<void> => {
    const {
        cod_responsavel,
        cod_cliente,
        canal_venda,
        data_venda,
        prazo,
        cod_centro_custo,
        frota,
        nf_compra,
        cod_transportadora,
        frete,
        endereco_cliente,
        logradouro,
        cidade,
        bairro,
        estado,
        complemento,
        numero,
        cep,
        observacoes_gerais,
        observacoes_internas,
        desconto_total,
        valor_total,
        situacao,
        parcelas,
        produtos,
        servicos,
        garantia,
        tipo_garantia,
        db_estrutura_orcamento,
    } = req.body;

    try {
        // Verifica se os campos obrigatórios estão presentes
        const missingFields: string[] = [];

        if (!cod_responsavel) missingFields.push('cod_responsavel');
        if (!cod_cliente) missingFields.push('cod_cliente');
        if (!canal_venda) missingFields.push('canal_venda');
        if (!data_venda) missingFields.push('data_venda');
        if (!prazo) missingFields.push('prazo');
        if (!frota) missingFields.push('frota');
        if (!cod_transportadora) missingFields.push('cod_transportadora');
        if (!valor_total) missingFields.push('valor_total');
        if (!situacao) missingFields.push('situacao');
        if (!garantia) missingFields.push('garantia');

        if (missingFields.length > 0) {
            res.status(400).json({
                msg: `Os campos são obrigatórios. Está faltando: ${missingFields.join(', ')}.`
            });
            return;
        }

        const formattedDataVenda = new Date(req.body.data_venda);
        const formattedPrazo = new Date(req.body.prazo);

        // Cria um novo orçamento no banco de dados
        const newOrcamento = await prisma.db_orcamentos.create({
            data: {
                cod_responsavel,
                cod_cliente,
                canal_venda,
                data_venda: formattedDataVenda.toISOString(), // formato ISO
                prazo: formattedPrazo.toISOString(),
                cod_centro_custo,
                frota,
                nf_compra,
                cod_transportadora,
                frete,
                endereco_cliente: endereco_cliente ?? "Nao",
                logradouro: logradouro || null,
                cidade: cidade || null,
                bairro: bairro || null,
                estado: estado || null,
                complemento: complemento || null,
                numero: numero ? Number(numero) : null,
                cep: cep || null,
                observacoes_gerais: observacoes_gerais || null,
                observacoes_internas: observacoes_internas || null,
                desconto_total,
                valor_total,
                situacao,
                garantia,
                tipo_garantia: tipo_garantia || 'dias',
                ...(
                    db_estrutura_orcamento
                        ? {
                            db_estrutura_orcamento: {
                                connect: { cod_estrutura_orcamento: db_estrutura_orcamento },
                            },
                        }
                        : {}
                ),
                db_pagamentos_orcamento: {
                    create: parcelas.map(({ valorParcela, cod_forma_pagamento, parcela, data_parcela, juros, tipo_juros }: any) => ({
                        valorParcela,
                        cod_forma_pagamento,
                        parcela,
                        data_parcela: new Date(data_parcela).toISOString(),
                        juros,
                        tipo_juros
                    }))
                },
                db_produtos_orcamento: {
                    create: produtos.map(({ cod_produto, quantidade, valor_unitario, valor_desconto, valor_total, tipo_desconto }: any) => ({
                        cod_produto,
                        quantidade,
                        valor_unitario,
                        valor_desconto,
                        valor_total,
                        tipo_desconto
                    }))
                },
                db_servicos_orcamento: {
                    create: servicos.map(({ cod_servico, quantidade, valor_unitario, valor_desconto, valor_total, tipo_desconto }: any) => ({
                        cod_servico,
                        quantidade,
                        valor_unitario,
                        valor_desconto,
                        valor_total,
                        tipo_desconto
                    }))
                }
            }
        });


        // Retorna uma resposta de sucesso
        res.status(201).json({
            msg: 'Orçamento cadastrado com sucesso.',
            orcamento: newOrcamento
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


