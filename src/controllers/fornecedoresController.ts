import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllFornecedores = async (req: Request, res: Response): Promise<void> => {
    try {
        const fornecedores = await prisma.db_fornecedores.findMany({
            include: {
                db_estabelecimentos_fornecedor: true,
            }
        });

        const tipos = ['PessoaFisica', 'PessoaJuridica'];

        res.status(200).json({
            msg: 'Fornecedores obtidas com sucesso.',
            fornecedores: fornecedores,
            tipos: tipos
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updateFornecedor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
        nome,
        tipo,
        telefone,
        celular,
        responsavel,
        email,
        observacoes,
        logradouro,
        cidade,
        bairro,
        estado,
        complemento,
        numero,
        cep,
        dtCadastro,
        estabelecimentos,
        insc_estadual,
        insc_municipal,
        documento
    } = req.body;

    try {
        const fornecedorToUpdate = await prisma.db_fornecedores.findUnique({
            where: { cod_fornecedor: parseInt(id) }
        });

        if (!fornecedorToUpdate) {
            res.status(404).json({ msg: 'Fornecedor não encontrado.' });
            return;
        }

        const formatedCelular = celular.replace(/\D/g, "");
        const formatedTelefone = telefone.replace(/\D/g, "");
        const formatedCEP = cep.replace(/\D/g, "");

        const updatedFornecedor = await prisma.db_fornecedores.update({
            where: { cod_fornecedor: parseInt(id) },
            data: {
                nome: nome || fornecedorToUpdate.nome,
                logradouro: logradouro || fornecedorToUpdate.logradouro,
                cidade: cidade || fornecedorToUpdate.cidade,
                bairro: bairro || fornecedorToUpdate.bairro,
                estado: estado || fornecedorToUpdate.estado,
                complemento: complemento || fornecedorToUpdate.complemento,
                responsavel: responsavel || fornecedorToUpdate.responsavel,
                observacoes: observacoes || fornecedorToUpdate.observacoes,
                insc_estadual: insc_estadual || fornecedorToUpdate.insc_estadual,
                insc_municipal: insc_municipal || fornecedorToUpdate.insc_municipal,
                documento: documento || fornecedorToUpdate.documento,

                numero: numero !== undefined && !isNaN(Number(numero))
                    ? Number(numero)
                    : fornecedorToUpdate.numero,

                dtCadastro: dtCadastro ?? fornecedorToUpdate.dtCadastro,

                cep: formatedCEP || fornecedorToUpdate.cep,
                email: email || fornecedorToUpdate.email,

                telefone: formatedTelefone || fornecedorToUpdate.telefone,
                celular: formatedCelular || fornecedorToUpdate.celular,

                // Garantir que 'tipo' seja um valor válido do enum
                tipo: tipo || fornecedorToUpdate.tipo,

                situacao: 'Ativo',
            }

        });

        // Atualização dos estabelecimentos
        if (Array.isArray(estabelecimentos) && estabelecimentos.length > 0) {
            await prisma.db_estabelecimentos_fornecedor.deleteMany({
                where: { cod_fornecedor: parseInt(id) }
            });

            const estabelecimentosValidos = estabelecimentos
                .map((estab: any) => ({
                    cod_estabel: Number(estab.cod_estabelecimento),
                    cod_fornecedor: parseInt(id)
                }))
                .filter(estab => !isNaN(estab.cod_estabel)); // Remove itens inválidos

            if (estabelecimentosValidos.length > 0) {
                await prisma.db_estabelecimentos_fornecedor.createMany({
                    data: estabelecimentosValidos
                });
            }
        }

        res.status(200).json({
            msg: 'Fornecedor atualizado com sucesso.',
            fornecedor: updatedFornecedor
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const deleteFornecedor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const fornecedor = await prisma.db_fornecedores.findUnique({
            where: { cod_fornecedor: parseInt(id) }
        });

        if (!fornecedor) {
            res.status(404).json({ msg: 'Fornecedor não encontrado.' });
            return;
        }

        await prisma.db_fornecedores.delete({
            where: { cod_fornecedor: parseInt(id) }
        });

        res.status(200).json({
            msg: 'Fornecedor deletado com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarFornecedor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar a fornecedor existente
        const fornecedorToCancel = await prisma.db_fornecedores.findUnique({
            where: { cod_fornecedor: parseInt(id) }
        });

        if (!fornecedorToCancel) {
            res.status(404).json({ msg: 'Fornecedor não encontrada.' });
            return;
        }

        // Atualizar a fornecedor para "Inativo"
        const updatedFornecedor = await prisma.db_fornecedores.update({
            where: { cod_fornecedor: parseInt(id) },
            data: {
                situacao: Situacao.Inativo
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Fornecedor cancelada com sucesso.',
            fornecedor: updatedFornecedor
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const registerFornecedor = async (req: Request, res: Response): Promise<void> => {
    const {
        nome,
        tipo,
        telefone,
        celular,
        responsavel,
        email,
        observacoes,
        logradouro,
        cidade,
        bairro,
        estado,
        complemento,
        numero,
        cep,
        estabelecimentos,
        insc_estadual,
        insc_municipal,
        documento
    } = req.body;

    try {
        // Verifica se os campos obrigatórios estão presentes
        if (!nome ||
            !tipo ||
            !celular ||
            !responsavel ||
            !email ||
            !cep ||
            !documento ||
            !estabelecimentos) {
            res.status(400).json({ msg: 'Os campos são obrigatórios.' });
            return;
        }

        if (Array.isArray(estabelecimentos)) {
            estabelecimentos.map((cod: string) => ({
                cod_estabel: parseInt(cod),
            }));

            const formatedCelular = celular.replace(/\D/g, "");
            const formatedTelefone = telefone.replace(/\D/g, "");
            const formatedCEP = cep.replace(/\D/g, "");

            // Cria um novo serviço no banco de dados
            const newFornecedor = await prisma.db_fornecedores.create({
                data: {
                    nome,
                    tipo,
                    telefone: String(formatedTelefone),
                    celular: String(formatedCelular),
                    responsavel: String(responsavel),
                    email,
                    observacoes,
                    logradouro,
                    cidade,
                    bairro,
                    estado,
                    complemento: complemento ?? null,
                    numero: Number(numero),
                    cep: formatedCEP,
                    dtCadastro: new Date(),
                    insc_estadual,
                    insc_municipal,
                    documento,
                    db_estabelecimentos_fornecedor: {
                        create: estabelecimentos.map(({ cod_estabelecimento }: any) => ({
                            cod_estabel: cod_estabelecimento
                        }))
                    }
                }
            });

            // Retorna uma resposta de sucesso
            res.status(201).json({
                msg: 'Fornecedor cadastrada com sucesso.',
                fornecedor: newFornecedor
            });
        }
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
