import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
        const permissions = await prisma.db_permissoes_grupo.findMany({
            include: {
                db_grupos: true,
                db_modulos: true,
            }
        });

        res.status(200).json({
            msg: 'Permissões de grupo obtidas com sucesso.',
            permissions: permissions
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const getPermissionsByGroupAndModule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userGroupId, moduleName } = req.params;

        if (!userGroupId || !moduleName) {
            res.status(400).json({ msg: 'ID do grupo e nome do módulo são necessários.' });
            return;
        }

        const permissions = await prisma.db_permissoes_grupo.findMany({
            where: {
                cod_grupo: parseInt(userGroupId),
                db_modulos: {
                    descricao: moduleName.toString(),
                },
            },
            include: {
                db_grupos: true,
                db_modulos: true,
            },
        });
        console.log(permissions)
        if (permissions.length === 0) {
            res.status(404).json({ msg: 'Nenhuma permissão encontrada para este grupo e módulo.' });
            return;
        }

        res.status(200).json({
            msg: 'Permissões de grupo e módulo obtidas com sucesso.',
            permissions: permissions
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const getAllGroupPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupPermissions = await prisma.db_grupos.findMany();

        res.status(200).json({
            msg: 'grupos obtidos com sucesso.',
            groups: groupPermissions
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const updatePermission = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // ID do grupo a ser atualizado
    const { nome, permissoes } = req.body; // 'nome' e 'permissoes' enviados do frontend

    try {
        const groupToUpdate = await prisma.db_grupos.findUnique({
            where: { cod_grupo: parseInt(id) },
        });

        if (!groupToUpdate) {
            res.status(404).json({ msg: 'Grupo não encontrado.' });
            return;
        }

        await prisma.db_grupos.update({
            where: { cod_grupo: parseInt(id) },
            data: { nome: nome, situacao: "Ativo" }
        });

        const existingPermissions = await prisma.db_permissoes_grupo.findMany({
            where: { cod_grupo: parseInt(id) },
        });

        const existingModules = new Set(existingPermissions.map(p => p.cod_modulo));
        const incomingModules = new Set(permissoes.map((p: any) => p.cod_modulo));

        const toDelete = existingPermissions.filter(p => !incomingModules.has(p.cod_modulo));
        const toUpdateOrCreate = permissoes.map(async (permissao: any) => {
            if (existingModules.has(permissao.cod_modulo)) {
                return prisma.db_permissoes_grupo.updateMany({
                    where: { cod_grupo: parseInt(id), cod_modulo: permissao.cod_modulo },
                    data: {
                        insercao: permissao.insercao ? 'SIM' : 'N_O',
                        edicao: permissao.edicao ? 'SIM' : 'N_O',
                        delecao: permissao.delecao ? 'SIM' : 'N_O',
                        visualizacao: permissao.visualizacao ? 'SIM' : 'N_O',
                    },
                });
            } else {
                return prisma.db_permissoes_grupo.create({
                    data: {
                        cod_grupo: parseInt(id),
                        cod_modulo: permissao.cod_modulo,
                        insercao: permissao.insercao ? 'SIM' : 'N_O',
                        edicao: permissao.edicao ? 'SIM' : 'N_O',
                        delecao: permissao.delecao ? 'SIM' : 'N_O',
                        visualizacao: permissao.visualizacao ? 'SIM' : 'N_O',
                    },
                });
            }
        });

        await Promise.all(toUpdateOrCreate);
        await prisma.db_permissoes_grupo.deleteMany({ where: { cod_permissao_grupo: { in: toDelete.map(p => p.cod_permissao_grupo) } } });

        res.status(200).json({ msg: 'Permissões de grupo atualizadas com sucesso.' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
;

export const deletePermission = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Localiza a permissão pelo ID para obter o cod_grupo
        const permission = await prisma.db_permissoes_grupo.findUnique({
            where: { cod_permissao_grupo: parseInt(id) },
            select: { cod_grupo: true }
        });

        if (!permission) {
            res.status(404).json({ msg: 'Grupo não encontrado.' });
            return;
        }

        const codGrupo = permission.cod_grupo;

        if (codGrupo === null) {
            res.status(400).json({ msg: 'O grupo associado é inválido (null).' });
            return;
        }

        // Deleta todas as permissões relacionadas ao cod_grupo
        await prisma.db_permissoes_grupo.deleteMany({
            where: { cod_grupo: codGrupo }
        });

        // Deleta o próprio grupo após remover as permissões
        await prisma.db_grupos.delete({
            where: { cod_grupo: codGrupo }
        });

        res.status(200).json({ msg: 'Grupo e permissões deletados com sucesso.' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelPermission = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Localiza a permissão pelo ID para obter o cod_grupo
        const permission = await prisma.db_permissoes_grupo.findUnique({
            where: { cod_permissao_grupo: parseInt(id) },
            select: { cod_grupo: true }
        });

        if (!permission) {
            res.status(404).json({ msg: 'Grupo não encontrado.' });
            return;
        }

        const codGrupo = permission.cod_grupo;

        if (codGrupo === null) {
            res.status(400).json({ msg: 'O grupo associado é inválido (null).' });
            return;
        }

        // Atualiza a situação do grupo para "Inativo"
        await prisma.db_grupos.update({
            where: { cod_grupo: codGrupo },
            data: { situacao: Situacao.Inativo }
        });

        res.status(200).json({ msg: 'Grupo cancelado com sucesso (situação alterada para Inativo).' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const registerPermission = async (req: Request, res: Response): Promise<void> => {
    const { cod_grupo, permissoes, nome } = req.body;
    console.log(permissoes.cod_modulo)
    try {
        if (cod_grupo === null) {
            res.status(400).json({ msg: 'Os campos cod_grupo e cod_modulo são obrigatórios.' });
            return;
        }

        const newGroup = await prisma.db_grupos.create({
            data: {
                nome: nome,
                dt_hr_criacao: new Date(),
                situacao: 'Ativo',
            },
            select: {
                cod_grupo: true,
            },
        });

        const permissionsPromises = permissoes.map(async (permissao: any) => {
            return prisma.db_permissoes_grupo.create({
                data: {
                    cod_grupo: newGroup.cod_grupo,
                    cod_modulo: permissao.cod_modulo,
                    insercao: permissao.insercao ? "SIM" : "N_O",
                    edicao: permissao.edicao ? "SIM" : "N_O",
                    delecao: permissao.delecao ? "SIM" : "N_O",
                    visualizacao: permissao.visualizacao ? "SIM" : "N_O",
                    dt_hr_criacao: new Date(),
                },
            });
        });

        const newPermissions = await Promise.all(permissionsPromises);

        res.status(201).json({
            msg: 'Permissões de grupo cadastradas com sucesso.',
            group: newGroup,
            permissions: newPermissions,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};
