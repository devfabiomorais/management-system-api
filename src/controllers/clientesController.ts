import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllClients = async (req: Request, res: Response): Promise<void> => {
    try {
        const clients = await prisma.db_clientes.findMany({
            include: {
                db_estabelecimentos_cliente: true,
            }
        });

        res.status(200).json({
            msg: 'Clientes obtidos com sucesso.',
            clients: clients
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
        nome,
        logradouro,
        cidade,
        bairro,
        estado,
        complemento,
        numero,
        cep,
        email,
        telefone,
        celular,
        tipo,
        documento,
        insc_estadual,
        insc_municipal
    } = req.body;

    try {
        const clientToUpdate = await prisma.db_clientes.findUnique({
            where: { cod_cliente: parseInt(id) }
        });

        if (!clientToUpdate) {
            res.status(404).json({ msg: 'Cliente não encontrado.' });
            return;
        }

        const formatedCelular = celular.replace(/\D/g, "");
        const formatedTelefone = telefone.replace(/\D/g, "");
        const formatedCEP = cep.replace(/\D/g, "");
        const formatedDocumento = documento.replace(/\D/g, "");

        const updatedClient = await prisma.db_clientes.update({
            where: { cod_cliente: parseInt(id) },
            data: {
                cod_cliente: clientToUpdate.cod_cliente,
                nome: nome || clientToUpdate.nome,
                logradouro: logradouro || clientToUpdate.logradouro,
                cidade: cidade || clientToUpdate.cidade,
                bairro: bairro || clientToUpdate.bairro,
                estado: estado || clientToUpdate.estado,
                complemento: complemento || clientToUpdate.complemento,
                numero: parseInt(numero) || clientToUpdate.numero,
                cep: formatedCEP || clientToUpdate.cep,
                email: email || clientToUpdate.email,
                telefone: telefone ? formatedTelefone : clientToUpdate.telefone,
                celular: formatedCelular || clientToUpdate.celular,
                situacao: 'ATIVO',
                tipo: tipo || clientToUpdate.tipo,
                documento: documento ? formatedDocumento : clientToUpdate.documento,
                insc_estadual: insc_estadual || clientToUpdate.insc_estadual,
                insc_municipal: insc_municipal || clientToUpdate.insc_municipal,
            }
        });

        res.status(200).json({
            msg: 'Cliente atualizado com sucesso.',
            client: updatedClient
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const client = await prisma.db_clientes.findUnique({
            where: { cod_cliente: parseInt(id) }
        });

        if (!client) {
            res.status(404).json({ msg: 'Cliente não encontrado.' });
            return;
        }

        await prisma.db_clientes.delete({
            where: { cod_cliente: parseInt(id) }
        });

        res.status(200).json({
            msg: 'Cliente deletado com sucesso.'
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarClient = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o cliente existente
        const clientToCancel = await prisma.db_clientes.findUnique({
            where: { cod_cliente: parseInt(id) }
        });

        if (!clientToCancel) {
            res.status(404).json({ msg: 'Cliente não encontrado.' });
            return;
        }

        // Atualizar o cliente para "Inativo"
        const updatedClient = await prisma.db_clientes.update({
            where: { cod_cliente: parseInt(id) },
            data: {
                situacao: 'DESATIVADO'
            }
        });

        // Retorna sucesso
        res.status(200).json({
            msg: 'Cliente cancelado com sucesso.',
            client: updatedClient
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const registerClient = async (req: Request, res: Response): Promise<void> => {
    const {
        nome,
        logradouro,
        cidade,
        bairro,
        estado,
        complemento,
        numero,
        cep,
        email,
        telefone,
        celular,
        situacao,
        tipo,
        documento,
        insc_estadual,
        insc_municipal
    } = req.body;

    try {
        const missingFields = [];

        if (!nome) missingFields.push("nome");
        if (!cidade) missingFields.push("cidade");
        if (!bairro) missingFields.push("bairro");
        if (!estado) missingFields.push("estado");
        if (!cep) missingFields.push("cep");
        if (!documento) missingFields.push("documento");

        if (missingFields.length > 0) {
            res.status(400).json({ msg: `Os seguintes campos são obrigatórios: ${missingFields.join(", ")}` });
            return;
        }

        const formatedCelular = celular.replace(/\D/g, "");
        const formatedTelefone = telefone.replace(/\D/g, "");
        const formatedCEP = cep.replace(/\D/g, "");
        const formatedDocumento = documento.replace(/\D/g, "");

        const newClient = await prisma.db_clientes.create({
            data: {
                nome,
                logradouro,
                cidade,
                bairro,
                estado,
                complemento,
                numero: parseInt(numero),
                cep: formatedCEP,
                email,
                telefone: formatedTelefone,
                celular: formatedCelular,
                situacao,
                tipo,
                documento: formatedDocumento,
                dt_hr_criacao: new Date(),
                insc_estadual,
                insc_municipal,
            }
        });

        res.status(201).json({
            msg: 'Cliente cadastrado com sucesso.',
            client: newClient
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
