import prisma from "../utils/connect.js";
import { z } from "zod";
import upload from '../config/multerConfig.js';

export const getAllPost = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const page = parseInt(req.query.page, 10) || 1;
        const offset = (page - 1) * limit;

        const totalPostagens = await prisma.post.count();
        const postagens = await prisma.post.findMany({
            skip: offset,
            take: limit,
            include: {
                author: true,
            },
        });

        const totalPaginas = Math.ceil(totalPostagens / limit);

        res.json({
            totalItems: totalPostagens,
            totalPages: totalPaginas,
            currentPage: page,
            itemsPerPage: limit,
            postagens,
            nextPage: page < totalPaginas ? `/postagens?page=${page + 1}&limit=${limit}` : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar as postagens." });
    }
};

export const createPost = async (req, res) => {
    try {
        const postSchema = z.object({
            titulo: z.string().min(4, "O título deve conter pelo menos 4 caracteres."),
            conteudo: z.string().min(10, "O conteúdo deve conter pelo menos 10 caracteres."),
            authorId: z.string().uuid(),
            imagem: z.string().optional(),
            published: z.boolean().default(false),
        });

        const { titulo, conteudo, authorId, imagem, published } = postSchema.parse(req.body);

        const newPost = await prisma.post.create({
            data: {
                titulo,
                conteudo,
                author: {
                    connect: { id: authorId }
                },
                imagem,
                published
            }
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao criar a postagem.", error: error.message });
    }
};

export const getPostById = async (req, res) => {
    try {
        const id = getSchema.parse(req.params);

        const post = await prisma.post.findUnique({
            where: { id: id.id },
            include: { author: true },
        });

        if (!post) {
            return res.status(404).json({ message: "Postagem não encontrada." });
        }

        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao buscar a postagem.", error: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const id = getSchema.parse(req.params);
        const updateSchema = z.object({
            titulo: z.string().min(4).optional(),
            conteudo: z.string().min(10).optional(),
            imagem: z.string().optional(),
            published: z.boolean().optional(),
        });

        const data = updateSchema.parse(req.body);

        const post = await prisma.post.update({
            where: { id: id.id },
            data,
        });

        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao atualizar a postagem.", error: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const id = getSchema.parse(req.params);

        await prisma.post.delete({
            where: { id: id.id },
        });

        res.json({ message: "Postagem excluída com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Erro ao excluir a postagem.", error: error.message });
    }
};

export const uploadImage = (req, res) => {
    upload.single('imagem')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const postId = req.params.id;
            const post = await prisma.post.findUnique({
                where: { id: postId }
            });

            if (!post) {
                return res.status(404).json({ message: "Postagem não encontrada." });
            }
            const imagePath = req.file ? `/uploads/images/${req.file.filename}` : null;
     
            const updatedPost = await prisma.post.update({
                where: { id: postId },
                data: {
                    imagem: imagePath
                }
            });

            res.json(updatedPost);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao atualizar a postagem com imagem.", error: error.message });
        }
    });
};