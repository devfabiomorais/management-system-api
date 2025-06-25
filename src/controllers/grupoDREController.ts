import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllGruposDRE = async (req: Request, res: Response): Promise<void> => {
    try {
        const gruposDRE = await prisma.db_grupo_dre.findMany({
            include: {
                db_despesas: true,
            }
        });

        res.status(200).json({
            msg: 'Gruposs DRE obtidos com sucesso.',
            gruposDRE: gruposDRE
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const registerGruposDRE = async (req: Request, res: Response): Promise<void> => {
    const {
        descricao,
        cod_despesa,
    } = req.body;

    try {
        // Verifica se os campos obrigatórios estão presentes
        if (!descricao || !cod_despesa) {
            res.status(400).json({ msg: 'O campo descrição é obrigatório.' });
            return;
        }

        // Cria um novo serviço no banco de dados
        const newGruposDRE = await prisma.db_grupo_dre.create({
            data: {
                descricao,
                cod_despesa,
            }
        });

        // Retorna uma resposta de sucesso
        res.status(201).json({
            msg: 'Gruposs DRE cadastrado com sucesso.',
            gruposDRE: newGruposDRE
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

// export const updateGruposDRE = async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;
//     const {
//         nome,
//         descricao,
//     } = req.body;

//     try {
//         const gruposDREToUpdate = await prisma.db_grupo_dre.findUnique({
//             where: { cod_grupos_dre: parseInt(id) }
//         });

//         if (!gruposDREToUpdate) {
//             res.status(404).json({ msg: 'Gruposs DRE não encontrado.' });
//             return;
//         }

//         const updatedCentroCusto = await prisma.db_grupo_dre.update({
//             where: { cod_grupos_dre: parseInt(id) },
//             data: {
//                 cod_grupos_dre: gruposDREToUpdate.cod_grupos_dre,
//                 descricao: descricao ?? gruposDREToUpdate.descricao,
//             }
//         });

//         res.status(200).json({
//             msg: 'Gruposs DRE atualizado com sucesso.',
//             gruposDRE: updatedCentroCusto
//         });
//     } catch (err: any) {
//         console.error(err.message);
//         res.status(500).json({ msg: 'Erro no servidor', error: err.message });
//     }
// };

// export const deleteGruposDRE = async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;

//     try {
//         const gruposDRE = await prisma.db_grupo_dre.findUnique({
//             where: { cod_grupos_dre: parseInt(id) }
//         });

//         if (!gruposDRE) {
//             res.status(404).json({ msg: 'Gruposs DRE não encontrado.' });
//             return;
//         }

//         await prisma.db_grupo_dre.delete({
//             where: { cod_grupos_dre: parseInt(id) }
//         });

//         res.status(200).json({
//             msg: 'Gruposs DRE deletado com sucesso.'
//         });
//     } catch (err: any) {
//         console.error(err.message);
//         res.status(500).json({ msg: 'Erro no servidor', error: err.message });
//     }
// };

// export const cancelarGruposDRE = async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;

//     try {
//         // Encontrar o centro de custo existente
//         const centroCustoToCancel = await prisma.db_grupo_dre.findUnique({
//             where: { cod_grupos_dre: parseInt(id) }
//         });

//         if (!centroCustoToCancel) {
//             res.status(404).json({ msg: 'Gruposs DRE não encontrado.' });
//             return;
//         }

//         // Atualizar o centro de custo
//         const updatedCentroCusto = await prisma.db_grupo_dre.update({
//             where: { cod_grupos_dre: parseInt(id) },
//             data: {
//                 situacao: Situacao.Inativo
//             }
//         });

//         // Retorna sucesso
//         res.status(200).json({
//             msg: 'Gruposs DRE cancelado com sucesso.',
//             centroCusto: updatedCentroCusto
//         });
//     } catch (err: any) {
//         console.error(err.message);
//         res.status(500).json({ msg: 'Erro no servidor', error: err.message });
//     }
// };

