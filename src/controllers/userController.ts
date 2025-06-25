import { Request, Response } from 'express';
import { PrismaClient, Situacao } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../services/emailService.js';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.db_usuarios.findMany({
            include: {
                db_grupos: true,
                db_estabelecimentos_usuario: true,
            },
        });
        res.status(200).json({ users: users });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { nome, email, senha, estabelecimentos, cod_grupo, situacao, usuario } = req.body;

    try {
        const existingUser = await prisma.db_usuarios.findFirst({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ msg: 'E-mail já está em uso.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        if (Array.isArray(estabelecimentos)) {
            estabelecimentos.map((cod: string) => ({
                cod_estabel: parseInt(cod),
            }));

            const user = await prisma.db_usuarios.create({
                data: {
                    nome,
                    email,
                    senha: hashedPassword,
                    usuario,
                    cod_grupo,
                    situacao,
                    dt_hr_criacao: new Date(),
                    db_estabelecimentos_usuario: {
                        create: estabelecimentos.map(({ cod_estabelecimento }: any) => ({
                            cod_estabel: cod_estabelecimento
                        }))
                    }
                },
                include: {
                    db_estabelecimentos_usuario: true,
                },
            });
            res.status(201).json({ msg: 'Usuário criado com sucesso.', user });
        }
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro ao criar usuário.', error: err.message });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { nome, email, cod_estabel, cod_grupo, situacao, usuario, estabelecimentos } = req.body;

    try {
        const existingUser = await prisma.db_usuarios.findUnique({
            where: { cod_usuario: parseInt(id) },
        });

        if (!existingUser) {
            res.status(404).json({ msg: 'Usuário não encontrado.' });
            return;
        }

        const userEstablishment = await prisma.db_estabelecimentos_usuario.findFirst({
            where: { cod_usuario: parseInt(id) },
        });

        const updatedUser = await prisma.db_usuarios.update({
            where: { cod_usuario: parseInt(id) },
            data: {
                nome,
                email,
                usuario,
                cod_grupo,
                situacao,
                db_estabelecimentos_usuario: {
                    upsert: {

                        where: { cod_estabel_usuario: userEstablishment?.cod_estabel_usuario || 0 },
                        update: { cod_estabel },
                        create: { cod_estabel },
                    },
                },
            },
            include: {
                db_estabelecimentos_usuario: true,
            },
        });

        // Atualização dos estabelecimentos
        if (Array.isArray(estabelecimentos) && estabelecimentos.length > 0) {
            await prisma.db_estabelecimentos_usuario.deleteMany({
                where: { cod_usuario: parseInt(id) }
            });

            const estabelecimentosValidos = estabelecimentos
                .map((estab: any) => ({
                    cod_estabel: Number(estab.cod_estabelecimento),
                    cod_usuario: parseInt(id)
                }))
                .filter(estab => !isNaN(estab.cod_estabel)); // Remove itens inválidos

            if (estabelecimentosValidos.length > 0) {
                await prisma.db_estabelecimentos_usuario.createMany({
                    data: estabelecimentosValidos
                });
            }
        }

        res.status(200).json({ msg: 'Usuário atualizado com sucesso.', updatedUser });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro ao atualizar usuário.', error: err.message });
    }
};


export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;

    try {

        const user = await prisma.db_usuarios.findUnique({
            where: { cod_usuario: Number(userId) },
        });

        if (!user) {
            res.status(404).json({ msg: 'Usuário não encontrado.' });
            return;
        }

        await prisma.db_usuarios.delete({
            where: { cod_usuario: Number(userId) },
        });

        res.status(200).json({ msg: 'Usuário deletado com sucesso.' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro ao deletar usuário.', error: err.message });
    }
};

export const cancelarUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        // Encontrar o usuário existente
        const userToCancel = await prisma.db_usuarios.findUnique({
            where: { cod_usuario: parseInt(id) },
        });

        if (!userToCancel) {
            res.status(404).json({ msg: 'Usuário não encontrado.' });
            return;
        }

        // Atualizar o usuário para "Inativo"
        const updatedUser = await prisma.db_usuarios.update({
            where: { cod_usuario: parseInt(id) },
            data: {
                situacao: 'DESATIVADO',
            },
        });

        res.status(200).json({
            msg: 'Usuário cancelado com sucesso.',
            updatedUser,
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};



export const validateCode = async (req: AuthRequest, res: Response): Promise<void> => {
    const { cod_usuario, code } = req.body;

    try {
        const tokenRecord = await prisma.db_tokens_usuarios.findFirst({
            where: {
                cod_usuario: parseInt(cod_usuario),
                token: code,
            },
        });

        if (!tokenRecord) {
            res.status(404).json({ msg: 'Código inválido ou usuário não encontrado.' });
            return;
        }

        if (!tokenRecord.dt_hr_limite) {
            res.status(400).json({ msg: 'Código sem data de expiração definida. Solicite um novo código.' });
            return;
        }

        if (new Date() > tokenRecord.dt_hr_limite) {
            res.status(400).json({ msg: 'Código expirado. Solicite um novo código.' });
            return;
        }

        res.status(200).json({ msg: 'Código validado com sucesso.' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};



export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { newPassword } = req.body;
    const { id } = req.params;

    try {
        // Verifica se o usuário existe
        const user = await prisma.db_usuarios.findUnique({
            where: { cod_usuario: parseInt(id) },
        });

        if (!user) {
            res.status(404).json({ msg: 'Usuário não encontrado' });
            return;
        }

        // Gera o hash da nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Atualiza a senha no banco de dados
        await prisma.db_usuarios.update({
            where: { cod_usuario: parseInt(id) },
            data: { senha: hashedPassword },
        });

        res.status(200).json({ msg: 'Senha atualizada com sucesso' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};


export const SendCode = async (req: AuthRequest, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
        const user = await prisma.db_usuarios.findFirst({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'E-mail não encontrado.' });
            return;
        }

        // Gera um código de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.db_tokens_usuarios.create({
            data: {
                cod_usuario: user.cod_usuario,
                token: resetCode,
                dt_hr_limite: new Date(Date.now() + 15 * 60 * 1000), // Expira em 15 minutos
            },
        });

        const emailHtml = `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd;">
        <!-- Cabeçalho -->
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
            <h2 style="margin: 0; color: #1e3a5f;">Portal</h2>
        </div>

        <!-- Corpo -->
        <div style="padding: 20px; text-align: center; color: #333;">
            <p style="font-size: 18px;">Olá ${user.nome},</p>
            <p style="font-size: 16px;">Você solicitou a redefinição de sua senha. Use o código abaixo para continuar:</p>
            <p style="font-size: 18px; font-weight: bold; color: #1e3a5f;">${resetCode}</p>
            <p style="font-size: 16px;">Este código é válido por 15 minutos.</p>
            <p style="font-size: 16px;">Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
        </div>

        <!-- Rodapé -->
        <div style="background-color: #1e3a5f; padding: 10px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #f0f0f0;">@devfabiomorais</p>
        </div>
    </div>
`;


        // **Enviando e-mail corretamente**
        const emailResponse = await sendEmail(
            email,
            "Código para Redefinir Senha",
            emailHtml
        );

        if (!emailResponse.success) {
            res.status(500).json({ message: 'Erro ao enviar e-mail.' });
            return;
        }

        res.status(200).json({ message: 'E-mail enviado com sucesso!', id: user.cod_usuario });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Erro no servidor.');
    }
};
