import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTransportadoras = async (req: Request, res: Response): Promise<void> => {
    try {
        const transportadoras = await prisma.db_transportadoras.findMany({
            include: {
                db_estabelecimentos_transportadora: true,
            }
        });

        const tipos = ['PessoaFisica', 'PessoaJuridica'];

        res.status(200).json({
            msg: 'Transportadoras obtidas com sucesso.',
            transportadoras: transportadoras,
            tipos: tipos
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updateTransportadora = async (req: Request, res: Response): Promise<void> => {
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
        const transportadoraToUpdate = await prisma.db_transportadoras.findUnique({
            where: { cod_transportadora: parseInt(id) }
        });

        if (!transportadoraToUpdate) {
            res.status(404).json({ msg: 'Transportadora não encontrado.' });
            return;
        }

        const formatedCelular = celular.replace(/\D/g, "");
        const formatedTelefone = telefone.replace(/\D/g, "");
        const formatedCEP = cep.replace(/\D/g, "");

        const updatedTransportadora = await prisma.db_transportadoras.update({
            where: { cod_transportadora: parseInt(id) },
            data: {
                nome: nome || transportadoraToUpdate.nome,
                logradouro: logradouro || transportadoraToUpdate.logradouro,
                cidade: cidade || transportadoraToUpdate.cidade,
                bairro: bairro || transportadoraToUpdate.bairro,
                estado: estado || transportadoraToUpdate.estado,
                complemento: complemento || transportadoraToUpdate.complemento,
                responsavel: responsavel || transportadoraToUpdate.responsavel,
                observacoes: observacoes || transportadoraToUpdate.observacoes,
                insc_estadual: insc_estadual || transportadoraToUpdate.insc_estadual,
                insc_municipal: insc_municipal || transportadoraToUpdate.insc_municipal,
                documento: documento || transportadoraToUpdate.documento,

                numero: numero !== undefined && !isNaN(Number(numero))
                    ? Number(numero)
                    : transportadoraToUpdate.numero,

                dtCadastro: dtCadastro ?? transportadoraToUpdate.dtCadastro,

                cep: formatedCEP || transportadoraToUpdate.cep,
                email: email || transportadoraToUpdate.email,

                telefone: formatedTelefone || transportadoraToUpdate.telefone,
                celular: formatedCelular || transportadoraToUpdate.celular,

                // Garantir que 'tipo' seja um valor válido do enum
                tipo: tipo || transportadoraToUpdate.tipo,

                situacao: 'Ativo',
            }

        });

        // Atualização dos estabelecimentos
        if (Array.isArray(estabelecimentos) && estabelecimentos.length > 0) {
            await prisma.db_estabelecimentos_transportadora.deleteMany({
                where: { cod_transportadora: parseInt(id) }
            });

            const estabelecimentosValidos = estabelecimentos
                .map((estab: any) => ({
                    cod_estabel: Number(estab.cod_estabelecimento),
                    cod_transportadora: parseInt(id)
                }))
                .filter(estab => !isNaN(estab.cod_estabel)); // Remove itens inválidos

            if (estabelecimentosValidos.length > 0) {
                await prisma.db_estabelecimentos_transportadora.createMany({
                    data: estabelecimentosValidos
                });
            }
        }

        res.status(200).json({
            msg: 'Transportadora atualizado com sucesso.',
            transportadora: updatedTransportadora
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const deleteTransportadora = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const transportadora = await prisma.db_transportadoras.findUnique({
            where: { cod_transportadora: parseInt(id) }
        });

        if (!transportadora) {
            res.status(404).json({ msg: 'Transportadora não encontrado.' });
            return;
        }

        await prisma.db_transportadoras.delete({
            where: { cod_transportadora: parseInt(id) }
        });

        res.status(200).json({
            msg: 'Transportadora deletado com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarTransportadora = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar a transportadora existente
        const transportadoraToCancel = await prisma.db_transportadoras.findUnique({
            where: { cod_transportadora: parseInt(id) }
        });

        if (!transportadoraToCancel) {
            res.status(404).json({ msg: 'Transportadora não encontrada.' });
            return;
        }

        // Atualizar a transportadora para "Inativo"
        const updatedTransportadora = await prisma.db_transportadoras.update({
            where: { cod_transportadora: parseInt(id) },
            data: {
                situacao: Situacao.Inativo
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Transportadora cancelada com sucesso.',
            transportadora: updatedTransportadora
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const registerTransportadora = async (req: Request, res: Response): Promise<void> => {
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
            const newTransportadora = await prisma.db_transportadoras.create({
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
                    db_estabelecimentos_transportadora: {
                        create: estabelecimentos.map(({ cod_estabelecimento }: any) => ({
                            cod_estabel: cod_estabelecimento
                        }))
                    }
                }
            });

            // Retorna uma resposta de sucesso
            res.status(201).json({
                msg: 'Transportadora cadastrada com sucesso.',
                transportadora: newTransportadora
            });
        }
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
