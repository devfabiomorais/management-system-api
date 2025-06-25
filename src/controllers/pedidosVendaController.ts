import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();


export const getAllPedidosVenda = async (req: Request, res: Response): Promise<void> => {
    try {
        const pedidos = await prisma.db_pedidos_venda.findMany({
            include: {
                db_clientes: true,
                db_usuarios: true,
                db_orcamentos: {
                    include: {
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
                },
            }
        });

        res.status(200).json({
            msg: 'Orçamentos obtidos com sucesso.',
            pedidos
        });
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Unknown error', err);
        res.status(500).json({ msg: 'Erro no servidor', error: err instanceof Error ? err.message : 'Erro desconhecido' });
    }
};


export const cancelarPedidoVenda = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o existente
        const pedidoToCancel = await prisma.db_pedidos_venda.findUnique({
            where: { cod_pedido_venda: parseInt(id) }
        });

        if (!pedidoToCancel) {
            res.status(404).json({ msg: 'Pedido de venda não encontrado.' });
            return;
        }

        // Atualizar
        const updatedPedido = await prisma.db_pedidos_venda.update({
            where: { cod_pedido_venda: parseInt(id) },
            data: {
                situacao: 'Cancelado'
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Pedido de venda cancelado com sucesso.',
            pedido: updatedPedido
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const registerPedidoVenda = async (req: Request, res: Response): Promise<void> => {
    const {
        cod_orcamento,
        cod_cliente,
        valor_total,
        cod_nota_fiscal
    } = req.body;

    try {
        // Verifica se os campos obrigatórios estão presentes
        const missingFields: string[] = [];

        if (!cod_orcamento) missingFields.push('cod_orcamento');
        if (!cod_cliente) missingFields.push('cod_cliente');
        if (!valor_total) missingFields.push('valor_total');
        if (!cod_nota_fiscal) missingFields.push('cod_nota_fiscal');

        if (missingFields.length > 0) {
            res.status(400).json({
                msg: `Os campos são obrigatórios. Está faltando: ${missingFields.join(', ')}.`
            });
            return;
        }

        const cod_usuario_pedido = (req as any).user?.id;
        const formattedDtHrPedido = new Date();

        // Cria um novo pedido de venda no banco de dados
        const newPedidoVenda = await prisma.db_pedidos_venda.create({
            data: {
                cod_orcamento: cod_orcamento || null,
                cod_cliente: cod_cliente,
                dt_hr_pedido: formattedDtHrPedido.toISOString(),
                cod_usuario_pedido: cod_usuario_pedido,
                situacao: "Pendente",
                valor_total: valor_total,
                cod_nota_fiscal: Number(cod_nota_fiscal) || null,
            },
        });

        await prisma.db_contas_financeiro.create({
            data: {
                tipo_conta: 'RECEBER',
                cod_cliente: cod_cliente,
                descricao: `Pedido de venda #${newPedidoVenda.cod_pedido_venda}`,
                dt_vencimento: formattedDtHrPedido,
                valor_bruto: valor_total,
                valor_final: valor_total,
                situacao: 'Ativo',
            }
        });

        // Retorna uma resposta de sucesso
        res.status(201).json({
            msg: 'Pedido de venda cadastrado com sucesso.',
            pedidoVenda: newPedidoVenda
        });
    } catch (err: any) {
        console.error(err.message);
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
        tipo_garantia
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




