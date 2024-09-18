import prisma from "../utils/connect.js";
import { z } from "zod";


export const getCommentsForPost = async (req, res) => {
    const { postagemId } = req.params;
    
    try {
        const comments = await prisma.comments.findMany({
            where: { postagemId },
            orderBy: { created_at: 'asc' }
        });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar comentários." });
    }
};


export const createCommentsForPost = async (req, res) => {
    const commentsSchema = z.object({
        conteudo: z.string().min(2, "O conteúdo deve conter pelo menos 2 caracteres!"),
        usuarioId: z.string().uuid(),
        postagemId: z.string().uuid()
    });

    try {
        const { conteudo, usuarioId, postagemId } = commentsSchema.parse(req.body);
        
 
        const postExists = await prisma.post.findUnique({
            where: { id: postagemId }
        });

        if (!postExists) {
            return res.status(404).json({ error: "Postagem não encontrada." });
        }

        const newComment = await prisma.comments.create({
            data: {
                conteudo,
                usuarioId,
                postagemId
            }
        });
        res.status(201).json(newComment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const editComment = async (req, res) => {
    const { comentarioId } = req.params;
    const { conteudo } = req.body;

    try {
        const comment = await prisma.comments.findUnique({
            where: { id: comentarioId }
        });

        if (!comment) {
            return res.status(404).json({ error: "Comentário não encontrado." });
        }

        const updatedComment = await prisma.comments.update({
            where: { id: comentarioId },
            data: { conteudo }
        });
        res.json(updatedComment);
    } catch (error) {
        res.status(400).json({ error: "Erro ao editar o comentário." });
    }
};


export const deleteComment = async (req, res) => {
    const { comentarioId } = req.params;

    try {
        const comment = await prisma.comments.findUnique({
            where: { id: comentarioId }
        });

        if (!comment) {
            return res.status(404).json({ error: "Comentário não encontrado." });
        }

        await prisma.comments.delete({
            where: { id: comentarioId }
        });
        res.status(204).json({ message: "Comentário deletado com sucesso!" });
    } catch (error) {
        res.status(400).json({ error: "Erro ao excluir o comentário." });
    }
};

