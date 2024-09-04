import prisma from "../utils/connect.js";
import { z } from "zod";

export const createAuthor = async (req, res) => {
    try {
        const authorSchema = z.object({
            name: z.string().min(4, "O nome deve conter pelo menos 4 caracteres."),
            number: z.number.min(8, "O numero deve conter pelo menos 10 caracteres."),
        });

        const { name, number } = authorSchema.parse(req.body);

        const newAuthor = await prisma.user.create({
            data: {
                name,
                number
            }
        });

        res.status(201).json(newAuthor);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao criar o author/usuário.", error: error.message });
    }
};