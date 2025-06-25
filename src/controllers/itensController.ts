import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';
import multer from "multer";
import path from "path";
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");
// Cria a pasta se ela não existir
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

const prisma = new PrismaClient();



export const updateItem = async (req: Request, res: Response): Promise<void> => {
    upload.single("anexo")(req, res, async (err) => {
        if (err) {
            console.error("Erro ao fazer upload do arquivo:", err);
            return res.status(500).json({ msg: "Erro ao fazer upload do arquivo", error: err.message });
        }

        const { id } = req.params;
        const {
            descricao,
            narrativa,
            cod_un,
            cod_familia,
            situacao,
            cod_estabelecimento,
            valor_custo,
            valor_venda,
            codigo
        } = req.body;

        // Validação de campos obrigatórios
        const missingFields = [];
        if (!descricao) missingFields.push("descricao");
        if (!narrativa) missingFields.push("narrativa");
        if (!cod_un) missingFields.push("cod_un");
        if (!cod_familia) missingFields.push("cod_familia");
        if (!situacao) missingFields.push("situacao");
        if (!valor_custo) missingFields.push("valor_custo");
        if (!valor_venda) missingFields.push("valor_venda");
        if (!codigo) missingFields.push("codigo");

        if (missingFields.length > 0) {
            return res.status(400).json({
                msg: `Os seguintes campos são obrigatórios: ${missingFields.join(", ")}`
            });
        }

        try {
            const item = await prisma.db_itens.findUnique({
                where: { cod_item: parseInt(id) },
                include: { db_estabelecimentos_item: true },
            });

            if (!item) {
                return res.status(404).json({ msg: "Item não encontrado." });
            }

            // Se houver novo arquivo e já existe um anexo, removemos o antigo
            if (req.file && item.anexo) {
                const oldFilePath = path.join(__dirname, "../../uploads", item.anexo);
                fs.unlink(oldFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error("Erro ao deletar o arquivo antigo:", unlinkErr);
                    } else {
                        console.log("Arquivo antigo deletado com sucesso:", item.anexo);
                    }
                });
            }

            let fotoPath = item.anexo; // Mantém o anexo anterior se não houver novo envio
            if (req.file) {
                fotoPath = req.file.filename;  // Salva só o nome do arquivo
            }

            const updatedItem = await prisma.db_itens.update({
                where: { cod_item: parseInt(id) },
                data: {
                    descricao,
                    narrativa,
                    cod_un: parseInt(cod_un),
                    cod_familia: parseInt(cod_familia),
                    situacao,
                    valor_custo: parseFloat(valor_custo),
                    valor_venda: parseFloat(valor_venda),
                    anexo: fotoPath,
                    codigo: codigo.toString(),
                },
            });

            // Atualização dos estabelecimentos
            if (Array.isArray(cod_estabelecimento) && cod_estabelecimento.length > 0) {
                await prisma.db_estabelecimentos_item.deleteMany({ where: { cod_item: parseInt(id) } });

                await prisma.db_estabelecimentos_item.createMany({
                    data: cod_estabelecimento.map((codEstabelecimento: string) => ({
                        cod_item: parseInt(id),
                        cod_estabel: parseInt(codEstabelecimento),
                    })),
                });
            }

            res.status(200).json({
                msg: "Item atualizado com sucesso.",
                item: updatedItem,
            });
        } catch (error: any) {
            console.error("Erro no servidor:", error.message);
            res.status(500).json({ msg: "Erro no servidor", error: error.message });
        }
    });
};

export const getAllItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await prisma.db_itens.findMany({
            include: {
                db_estabelecimentos_item: true,
                db_familias: true,
                db_unidades_medida: true,
            }
        });

        res.status(200).json({
            msg: 'Itens obtidos com sucesso.',
            items: items
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const item = await prisma.db_itens.findUnique({
            where: { cod_item: parseInt(id) },
        });

        if (!item) {
            res.status(404).json({ msg: 'Item não encontrado.' });
            return;
        }

        await prisma.db_itens.delete({
            where: { cod_item: parseInt(id) },
        });

        res.status(200).json({
            msg: 'Item deletado com sucesso.',
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const cancelarItem = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o item existente
        const itemToCancel = await prisma.db_itens.findUnique({
            where: { cod_item: parseInt(id) },
        });

        if (!itemToCancel) {
            res.status(404).json({ msg: 'Item não encontrado.' });
            return;
        }

        // Atualizar o item para "Inativo" ou status equivalente
        const updatedItem = await prisma.db_itens.update({
            where: { cod_item: parseInt(id) },
            data: {
                situacao: 'DESATIVADO', // Ou outro status de cancelamento
            },
        });

        res.status(200).json({
            msg: 'Item cancelado com sucesso.',
            updatedItem,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const registerItem = async (req: Request, res: Response): Promise<void> => {

    const {
        descricao,
        narrativa,
        cod_un,
        cod_familia,
        situacao,
        cod_estabelecimento,
        valor_custo,
        valor_venda,
        codigo
    } = req.body;

    try {
        const missingFields = [];

        if (!descricao) missingFields.push("descricao");
        if (!narrativa) missingFields.push("narrativa");
        if (!cod_un) missingFields.push("cod_un");
        if (!cod_familia) missingFields.push("cod_familia");
        if (!situacao) missingFields.push("situacao");
        if (!cod_estabelecimento) missingFields.push("cod_estabelecimento");
        if (!valor_custo) missingFields.push("valor_custo");
        if (!valor_venda) missingFields.push("valor_venda");
        if (!codigo) missingFields.push("codigo");

        if (missingFields.length > 0) {
            res.status(400).json({
                msg: `Os seguintes campos são obrigatórios: ${missingFields.join(", ")}`
            });
            return;
        }

        let fotoPath = '';
        if (req.file !== undefined) {
            fotoPath = req.file.filename;  // Salva só o nome do arquivo no banco
        } else {
            // Opcional: retornar erro caso anexo seja obrigatório
            res.status(400).json({ msg: "Anexo é obrigatório." });
            return;
        }

        if (Array.isArray(cod_estabelecimento)) {
            const establishments = cod_estabelecimento.map((cod: string) => ({
                cod_estabel: parseInt(cod),
            }));

            const newItem = await prisma.db_itens.create({
                data: {
                    descricao,
                    narrativa,
                    valor_custo: parseFloat(valor_custo),
                    valor_venda: parseFloat(valor_venda),
                    cod_un: parseInt(cod_un),
                    cod_familia: parseInt(cod_familia),
                    situacao,
                    dt_hr_criacao: new Date(),
                    anexo: fotoPath,
                    db_estabelecimentos_item: {
                        create: establishments,
                    },
                    codigo: codigo.toString(),
                },
            });

            res.status(201).json({
                msg: "Item cadastrado com sucesso.",
                item: newItem,
            });
        } else {
            res.status(400).json({ msg: "cod_estabelecimento deve ser um array." });
        }
    } catch (error: any) {
        console.error("Erro no servidor:", error.message);
        res.status(500).json({ msg: "Erro no servidor", error: error.message });
    }
};

