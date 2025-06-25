import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, Situacao } from '@prisma/client';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { name, user, email, password, cod_grupo, situacao } = req.body;

    try {
        if (!name || !user || !email || !password || !cod_grupo || !situacao) {
            res.status(400).json({ msg: 'Todos os campos são obrigatórios.' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ msg: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        const existingUser = await prisma.db_usuarios.findFirst({
            where: {
                OR: [{ usuario: user }, { email }]
            }
        });

        if (existingUser) {
            res.status(400).json({ msg: 'Usuário ou e-mail já cadastrados.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.db_usuarios.create({
            data: {
                nome: name,
                usuario: user,
                email,
                senha: hashedPassword,
                cod_grupo,
                situacao,
                dt_hr_criacao: new Date().toISOString()
            }
        });

        res.status(201).json({
            msg: 'Usuário cadastrado com sucesso.',
            user: {
                id: newUser.cod_usuario,
                nome: newUser.nome,
                usuario: newUser.usuario,
                email: newUser.email
            }
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ msg: 'Erro no servidor', error: err.message });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { user, password } = req.body;

    try {
        const userDb = await prisma.db_usuarios.findFirst({
            where: {
                usuario: user,
                situacao: 'ATIVO',
            },
        });

        if (!userDb) {
            return res.status(400).json({ msg: 'Credenciais inválidas ou usuário inativo' });
        }

        const isMatch = await bcrypt.compare(password, userDb.senha || '');
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciais inválidas' });
        }

        const payload = {
            user: {
                id: userDb.cod_usuario,
                name: userDb.usuario,
                email: userDb.email,
                cod_grupo: userDb.cod_grupo,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: '24h',
        });

        res.json({ token, cod_grupo: userDb.cod_grupo });
    } catch (err) {
        res.status(500).json({ msg: 'Erro no servidor', error: (err as Error).message });
    }
};
