import prisma from "../utils/connect.js";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const userSchema = z.object({
    name: z.string().min(4, "O nome deve conter pelo menos 4 caracteres."),
    email: z.string().email("Formato de e-mail inválido."),
    password: z.string().min(8, "A senha deve conter pelo menos 8 caracteres."),
    role: z.enum(["administrador", "autor", "leitor"]).optional(),
});


export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = userSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "E-mail já está em uso." });
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "leitor",
            },
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao registrar o usuário.", error: error.message });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = z.object({
            email: z.string().email("Formato de e-mail inválido."),
            password: z.string(),
        }).parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "E-mail ou senha incorretos." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "E-mail ou senha incorretos." });
        }

        // Gerar token JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao fazer login.", error: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, email, password } = z.object({
            name: z.string().min(4).optional(),
            email: z.string().email().optional(),
            password: z.string().min(8).optional(),
        }).parse(req.body);

        // Hash da nova senha, se fornecida
        let hashedPassword = undefined;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao atualizar o perfil.", error: error.message });
    }
};

export const listUsers = async (req, res) => {
    try {
        const { name, email, role } = req.query;

        const filters = {
            where: {
                ...(name && { name: { contains: name, mode: "insensitive" } }),
                ...(email && { email: { contains: email, mode: "insensitive" } }),
                ...(role && { role }),
            },
        };

        const users = await prisma.user.findMany(filters);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao listar os usuários.", error: error.message });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;

        await prisma.user.delete({ where: { id } });
        res.json({ message: "Usuário excluído com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao excluir o usuário.", error: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const id = req.params.id;
        const { role } = z.object({ role: z.enum(["administrador", "autor", "leitor"]) }).parse(req.body);

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao atualizar o papel do usuário.", error: error.message });
    }
};
